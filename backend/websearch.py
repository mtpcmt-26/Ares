"""Free, keyless web search for Ares.

Sources (no API keys required):
  1. DuckDuckGo HTML endpoint  -> general results (title, url, snippet)
  2. Google News RSS           -> fresh, dated headlines for current events
  3. Page extraction           -> plain text of the top results

Everything the LLM receives from here is treated as untrusted data.
"""

import asyncio
import html
import logging
import re
import xml.etree.ElementTree as ET
from urllib.parse import quote_plus, unquote, urlparse

import httpx

logger = logging.getLogger(__name__)

UA = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    '(KHTML, like Gecko) Version/17.0 Safari/605.1.15'
)
HEADERS = {'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9'}

NEWS_HINTS = (
    'news', 'today', 'latest', 'current', 'recent', 'now', 'this week', 'this month',
    'yesterday', 'breaking', 'update', 'updates', 'price', 'stock', 'score', 'won',
    'wins', 'election', 'released', 'launch', 'who is', 'weather', '2025', '2026',
)


def _clean(text: str) -> str:
    text = re.sub(r'<[^>]+>', '', text or '')
    return html.unescape(text).strip()


def _real_url(href: str) -> str:
    if not href:
        return ''
    if 'uddg=' in href:
        try:
            return unquote(href.split('uddg=')[1].split('&')[0])
        except Exception:
            return href
    if href.startswith('//'):
        return 'https:' + href
    return href


async def ddg_search(client: httpx.AsyncClient, query: str, limit: int = 6):
    try:
        r = await client.post(
            'https://html.duckduckgo.com/html/',
            data={'q': query},
            headers=HEADERS,
            follow_redirects=True,
        )
        blocks = re.split(r'class="result results_links', r.text)[1:]
        out = []
        for b in blocks:
            m_link = re.search(r'result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', b, re.S)
            if not m_link:
                continue
            m_snip = re.search(r'result__snippet"[^>]*>(.*?)</a>', b, re.S)
            url = _real_url(m_link.group(1))
            title = _clean(m_link.group(2))
            if not url.startswith('http') or not title:
                continue
            out.append(
                {
                    'title': title,
                    'url': url,
                    'snippet': _clean(m_snip.group(1)) if m_snip else '',
                    'source': urlparse(url).netloc,
                    'date': '',
                }
            )
            if len(out) >= limit:
                break
        return out
    except Exception as e:
        logger.warning(f'ddg search failed: {e}')
        return []


async def news_search(client: httpx.AsyncClient, query: str, limit: int = 5):
    try:
        r = await client.get(
            f'https://news.google.com/rss/search?q={quote_plus(query)}&hl=en-US&gl=US&ceid=US:en',
            headers=HEADERS,
            follow_redirects=True,
        )
        root = ET.fromstring(r.text)
        out = []
        for item in root.findall('./channel/item')[:limit]:
            title = _clean(item.findtext('title') or '')
            link = item.findtext('link') or ''
            if not title or not link:
                continue
            out.append(
                {
                    'title': title,
                    'url': link,
                    'snippet': _clean(item.findtext('description') or '')[:400],
                    'source': (item.findtext('source') or urlparse(link).netloc),
                    'date': item.findtext('pubDate') or '',
                }
            )
        return out
    except Exception as e:
        logger.warning(f'news search failed: {e}')
        return []


async def fetch_page(client: httpx.AsyncClient, url: str, max_chars: int = 3500) -> str:
    try:
        r = await client.get(url, headers=HEADERS, follow_redirects=True)
        if r.status_code >= 400 or 'text/html' not in r.headers.get('content-type', 'text/html'):
            return ''
        body = r.text
        body = re.sub(r'(?is)<(script|style|nav|footer|header|noscript|svg)[^>]*>.*?</\1>', ' ', body)
        body = re.sub(r'(?is)<br\s*/?>|</p>', '\n', body)
        text = _clean(body)
        text = re.sub(r'\n{2,}', '\n', text)
        text = re.sub(r'[ \t]{2,}', ' ', text)
        return text[:max_chars]
    except Exception:
        return ''


def looks_time_sensitive(query: str) -> bool:
    q = query.lower()
    return any(h in q for h in NEWS_HINTS)


async def search_web(query: str) -> tuple[str, list]:
    """Returns (context_block, citations). Citations: [{title, url, source, date}]."""
    async with httpx.AsyncClient(timeout=18) as client:
        tasks = [ddg_search(client, query)]
        if looks_time_sensitive(query):
            tasks.append(news_search(client, query))
        gathered = await asyncio.gather(*tasks, return_exceptions=True)

        results = []
        for g in gathered:
            if isinstance(g, list):
                results.extend(g)

        # de-duplicate by url
        seen, unique = set(), []
        for r in results:
            if r['url'] in seen:
                continue
            seen.add(r['url'])
            unique.append(r)
        unique = unique[:8]
        if not unique:
            return '', []

        # pull full text for the top 3 links for real substance
        pages = await asyncio.gather(
            *[fetch_page(client, r['url']) for r in unique[:3]], return_exceptions=True
        )

    lines = []
    for i, r in enumerate(unique, start=1):
        meta = ' | '.join(x for x in [r.get('source'), r.get('date')] if x)
        lines.append(f'[{i}] {r["title"]} ({meta})\n{r.get("snippet", "")}\nURL: {r["url"]}')

    for i, page in enumerate(pages, start=1):
        if isinstance(page, str) and len(page) > 200:
            lines.append(f'--- Full text of source [{i}] ---\n{page}')

    citations = [
        {'title': r['title'], 'url': r['url'], 'source': r.get('source', ''), 'date': r.get('date', '')}
        for r in unique
    ]
    return '\n\n'.join(lines), citations
