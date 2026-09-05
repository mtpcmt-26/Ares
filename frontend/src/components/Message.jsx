import React from 'react';
import { Copy, Globe } from 'lucide-react';

const Paragraphs = ({ text }) =>
  String(text)
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((line, i) => (
      <p key={i} className="text-[13px] leading-[1.62]" style={{ color: 'var(--ares-text)' }}>
        {line}
      </p>
    ));

const Message = ({ msg, streaming }) => {
  if (msg.role === 'user') {
    return (
      <div className="ares-in flex justify-end mb-7">
        <div
          className="max-w-[78%] px-3 py-2"
          style={{ background: 'var(--ares-bubble-user)', color: 'var(--ares-bubble-user-text)' }}
        >
          {msg.image_b64 && (
            <img
              src={`data:image/png;base64,${msg.image_b64}`}
              alt="attachment"
              className="mb-2 max-h-[180px] w-auto"
            />
          )}
          <span className="text-[13px] leading-[1.6] whitespace-pre-wrap">{msg.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ares-in flex items-start gap-2 mb-7 group">
      <div
        className="w-[16px] h-[16px] shrink-0 mt-[6px] flex items-center justify-center text-[9px]"
        style={{ background: '#2a2a2a', color: '#dcdcdc' }}
      >
        A
      </div>
      <div
        className="relative max-w-[92%] px-3 py-2.5"
        style={{ border: '1px solid var(--ares-border)', background: 'rgba(20,20,20,0.72)' }}
      >
        {msg.image_b64 && (
          <img
            src={`data:image/png;base64,${msg.image_b64}`}
            alt="generated"
            className="mb-2 w-full max-w-[420px]"
          />
        )}
        <div className="space-y-[2px]">
          {msg.searching && !msg.content && (
            <p className="text-[12px] flex items-center gap-2" style={{ color: 'var(--ares-muted)' }}>
              <Globe size={11} className="animate-spin" style={{ animationDuration: '2.4s' }} />
              Searching the live web...
            </p>
          )}
          <Paragraphs text={msg.content} />
          {streaming && <span className="ares-caret text-[13px]">▍</span>}
        </div>

        {msg.citations?.length > 0 && (
          <div className="mt-3 pt-2 space-y-1" style={{ borderTop: '1px solid var(--ares-border)' }}>
            <div className="ares-label flex items-center gap-1">
              <Globe size={10} /> sources
            </div>
            {msg.citations.map((c, i) => {
              const url = typeof c === 'string' ? c : c.url;
              const title = typeof c === 'string' ? c : c.title || c.url;
              const meta = typeof c === 'string' ? '' : [c.source, c.date].filter(Boolean).join(' \u00b7 ');
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block ares-btn"
                  style={{ color: 'var(--ares-accent)' }}
                >
                  <span className="text-[11px] truncate block">
                    [{i + 1}] {title}
                  </span>
                  {meta && (
                    <span className="text-[10px] block truncate" style={{ color: 'var(--ares-muted)' }}>
                      {meta}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {!streaming && msg.content && (
          <button
            onClick={() => navigator.clipboard.writeText(msg.content)}
            className="ares-btn opacity-0 group-hover:opacity-100 absolute right-2 -bottom-[18px] flex items-center gap-1"
            style={{ color: 'var(--ares-muted)' }}
          >
            <Copy size={10} />
            <span className="ares-label">copy</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Message;
