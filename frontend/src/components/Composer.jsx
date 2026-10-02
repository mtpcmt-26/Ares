import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Image as ImageIcon, Trash2, ArrowUp, Sparkles, ChevronDown, Globe, X } from 'lucide-react';
import { MODELS, modelById } from '../lib/constants';

const Composer = ({
  model,
  onModel,
  onSend,
  busy,
  imageMode,
  onImageMode,
  webSearch,
  onWebSearch,
  webEnabled,
  onClear,
  attachment,
  onAttach,
  onRemoveAttachment,
}) => {
  const [text, setText] = useState('');
  const [openModels, setOpenModels] = useState(false);
  const taRef = useRef(null);
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenModels(false);
    };
    const escape = (e) => { if (e.key === 'Escape') { setOpenModels(false); menuRef.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', onDoc);
    if (openModels) document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', escape); };
  }, [openModels]);

  useEffect(() => {
    const input = taRef.current;
    const resize = () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    };
    resize();
    let width = input.clientWidth;
    let frame;
    const observer = new ResizeObserver(() => {
      if (input.clientWidth !== width) {
        width = input.clientWidth;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(resize);
      }
    });
    observer.observe(input);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [text]);

  const submit = () => {
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    onSend(t);
  };

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onAttach(String(reader.result).split(',')[1]);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  return (
    <div className="ares-composer ares-chat-width" data-testid="chat-composer">
      <div
        className="ares-input ares-composer-surface"
      >
        {attachment && (
          <div className="px-3 pt-3 flex items-start gap-2">
            <img
              src={`data:image/png;base64,${attachment}`}
              alt="attachment"
              data-testid="composer-attachment-preview"
              className="h-[54px] max-w-[80%] object-contain w-auto"
              style={{ border: '1px solid var(--ares-border)' }}
            />
            <button onClick={onRemoveAttachment} className="ares-btn ares-icon-button" aria-label="Remove attachment" data-testid="attachment-remove-button" style={{ color: 'var(--ares-muted)' }}>
              <X size={12} />
            </button>
          </div>
        )}

        <textarea
          ref={taRef}
          data-testid="message-input"
          aria-label="Message Ares"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia('(pointer: coarse)').matches) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={imageMode ? 'Describe an image…' : 'Message Ares…'}
          className="ares-message-input w-full resize-none bg-transparent outline-none px-3 pt-3 pb-1 ares-scroll"
          style={{ color: 'var(--ares-text)' }}
        />

        <div className="ares-composer-toolbar">
          <div ref={menuRef} className="relative ares-model-picker">
            <button
              data-testid="model-picker-button"
              aria-expanded={openModels}
              aria-controls="ares-models"
              onClick={() => setOpenModels((o) => !o)}
              className="ares-btn ares-model-trigger flex items-center gap-1.5 px-2 py-1"
              style={{ border: '1px solid var(--ares-border-soft)', color: 'var(--ares-text-dim)' }}
            >
              <Sparkles size={11} style={{ color: 'var(--ares-accent)' }} />
              <span className="text-[11px] truncate">{modelById(model).label}</span>
              <ChevronDown size={11} />
            </button>
            {openModels && (
              <div
                id="ares-models"
                data-testid="model-picker-menu"
                className="ares-pop ares-model-menu ares-scroll"
                style={{
                  background: 'var(--ares-panel)',
                  border: '1px solid var(--ares-border)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
                }}
              >
                {MODELS.map((mo) => (
                  <button
                    key={mo.id}
                    data-testid={`model-option-${mo.id}`}
                    aria-pressed={mo.id === model}
                    onClick={() => {
                      onModel(mo.id);
                      setOpenModels(false);
                    }}
                    className="ares-btn w-full text-left px-3 py-2"
                    style={{ background: mo.id === model ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        mo.id === model ? 'rgba(255,255,255,0.06)' : 'transparent')
                    }
                  >
                    <span className="block text-[11px]" style={{ color: 'var(--ares-text)' }}>
                      {mo.label}
                    </span>
                    <span className="block text-[10px] mt-[2px]" style={{ color: 'var(--ares-muted)' }}>
                      {mo.note}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} data-testid="attachment-input" aria-label="Attach image" />
          <button
            data-testid="attachment-button"
            aria-label="Attach image"
            onClick={() => fileRef.current?.click()}
            className="ares-btn ares-icon-button"
            style={{ color: 'var(--ares-text-dim)' }}
            title="Attach image"
          >
            <Paperclip size={13} />
          </button>
          <button
            data-testid="image-mode-button"
            aria-label="Image generation mode"
            aria-pressed={imageMode}
            onClick={onImageMode}
            className="ares-btn ares-icon-button"
            style={{ color: imageMode ? 'var(--ares-accent)' : 'var(--ares-text-dim)' }}
            title="Image generation mode"
          >
            <ImageIcon size={13} />
          </button>
          <button
            data-testid="web-search-button"
            aria-label="Live web search"
            aria-pressed={webSearch}
            disabled={!webEnabled}
            onClick={() => webEnabled && onWebSearch()}
            className="ares-btn ares-icon-button"
            style={{
              color: webSearch ? 'var(--ares-accent)' : 'var(--ares-text-dim)',
              opacity: webEnabled ? 1 : 0.35,
              cursor: webEnabled ? 'pointer' : 'not-allowed',
            }}
            title={
              webSearch
                ? 'Live web search: ON for every message'
                : 'Live web search \u2014 auto-used for news & time-sensitive questions. Click to force on.'
            }
          >
            <Globe size={13} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              data-testid="clear-conversation-button"
              aria-label="Clear conversation"
              onClick={onClear}
              className="ares-btn ares-icon-button"
              style={{ color: 'var(--ares-text-dim)' }}
              title="Clear conversation"
            >
              <Trash2 size={13} />
            </button>
            <button
              data-testid="send-message-button"
              aria-label="Send message"
              onClick={submit}
              disabled={busy || !text.trim()}
              className="ares-btn ares-icon-button ares-send-button"
              style={{
                background: busy ? '#2a2a2a' : '#bdbdbd',
                color: '#101010',
                opacity: busy || !text.trim() ? 0.45 : 1,
              }}
              title="Send"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
      <p className="ares-composer-note text-center text-[10px] mt-2" data-testid="chat-disclaimer" style={{ color: 'var(--ares-muted)' }}>
        Ares can make mistakes. Fact-check anything important.
      </p>
    </div>
  );
};

export default Composer;
