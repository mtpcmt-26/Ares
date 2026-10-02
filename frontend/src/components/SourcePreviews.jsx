import React, { useState } from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';

const normalizeSource = (citation) => {
  try {
    const url = new URL(typeof citation === 'string' ? citation : citation?.url);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    const domain = url.hostname.replace(/^www\./, '');
    const date = typeof citation === 'string' ? null : new Date(citation.date);
    return {
      url: url.href,
      favicon: `${url.origin.replace(/^http:/, 'https:')}/favicon.ico`,
      domain,
      title: typeof citation === 'string' ? domain : citation.title || domain,
      publisher: typeof citation === 'string' ? domain : citation.source || domain,
      date: date && !Number.isNaN(date.getTime()) && citation.date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '',
    };
  } catch { return null; }
};

const SourceCard = ({ source, index, messageId }) => {
  const [failed, setFailed] = useState(false);
  const id = `source-${messageId}-${index + 1}`;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="ares-source-card" title={source.title} aria-label={`${index + 1}. ${source.title} — ${source.publisher} (opens in a new tab)`} data-testid={id}>
      <span className="ares-source-meta">
        <span className="ares-source-icon" aria-hidden="true">
          {failed ? <Globe size={14} data-testid={`${id}-fallback`} /> : <img src={source.favicon} alt="" width="16" height="16" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} data-testid={`${id}-favicon`} />}
        </span>
        <span className="truncate flex-1" data-testid={`${id}-publisher`}>{source.publisher}</span>
        <span className="ares-source-number">{index + 1}</span>
      </span>
      <span className="ares-source-headline" data-testid={`${id}-headline`}>{source.title}</span>
      <span className="ares-source-footer"><span className="truncate">{source.date || source.domain}</span><ArrowUpRight size={14} className="shrink-0" aria-hidden="true" /></span>
    </a>
  );
};

export const SourcePreviews = ({ citations, messageId }) => {
  const sources = citations.map((citation, index) => ({ source: normalizeSource(citation), index })).filter(({ source }) => source);
  if (!sources.length) return null;
  return (
    <section className="ares-sources" aria-label="Sources" data-testid={`sources-${messageId}`}>
      <div className="ares-label flex items-center gap-2 mb-2" data-testid={`sources-${messageId}-count`}><Globe size={12} />Sources <span>{sources.length}</span></div>
      <div className="ares-source-grid">{sources.map(({ source, index }) => <SourceCard key={`${index}-${source.url}`} source={source} index={index} messageId={messageId} />)}</div>
    </section>
  );
};