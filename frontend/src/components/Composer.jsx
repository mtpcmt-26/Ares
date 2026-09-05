import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Image as ImageIcon, Trash2, ArrowUp, Sparkles, ChevronDown, Globe, X } from 'lucide-react';
import { MODELS, modelById, modeById } from '../lib/constants';

const Composer = ({
  mode,
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
  const m = modeById(mode);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenModels(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 180) + 'px';
    }
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
    <div className="w-full max-w-[570px] mx-auto px-4 pb-3">
      <div
        style={{ border: '1px solid var(--ares-border)', background: 'rgba(18,18,18,0.86)' }}
        className="ares-input"
      >
        {attachment && (
          <div className="px-3 pt-3 flex items-start gap-2">
            <img
              src={`data:image/png;base64,${attachment}`}
              alt="attachment"
              className="h-[54px] w-auto"
              style={{ border: '1px solid var(--ares-border)' }}
            />
            <button onClick={onRemoveAttachment} className="ares-btn" style={{ color: 'var(--ares-muted)' }}>
              <X size={12} />
            </button>
          </div>
        )}

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            imageMode
              ? 'Describe an image for Ares to generate'
              : `Message Ares \u2014 ${m.label.charAt(0) + m.label.slice(1).toLowerCase()} mode`
          }
          className="w-full resize-none bg-transparent outline-none px-3 pt-3 pb-1 text-[13px] ares-scroll"
          style={{ color: 'var(--ares-text)' }}
        />

        <div className="flex items-center gap-2 px-2 pb-2 pt-1">
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpenModels((o) => !o)}
              className="ares-btn flex items-center gap-1.5 px-2 py-1"
              style={{ border: '1px solid var(--ares-border-soft)', color: 'var(--ares-text-dim)' }}
            >
              <Sparkles size={11} style={{ color: 'var(--ares-accent)' }} />
              <span className="text-[11px]">{modelById(model).label}</span>
              <ChevronDown size={11} />
            </button>
            {openModels && (
              <div
                className="ares-pop absolute bottom-[34px] left-0 w-[210px] py-1 z-40"
                style={{
                  background: '#151515',
                  border: '1px solid var(--ares-border)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
                }}
              >
                {MODELS.map((mo) => (
                  <button
                    key={mo.id}
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

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="ares-btn p-1"
            style={{ color: 'var(--ares-text-dim)' }}
            title="Attach image"
          >
            <Paperclip size={13} />
          </button>
          <button
            onClick={onImageMode}
            className="ares-btn p-1"
            style={{ color: imageMode ? 'var(--ares-accent)' : 'var(--ares-text-dim)' }}
            title="Image generation mode"
          >
            <ImageIcon size={13} />
          </button>
          <button
            onClick={() => webEnabled && onWebSearch()}
            className="ares-btn p-1"
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

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onClear}
              className="ares-btn p-1"
              style={{ color: 'var(--ares-text-dim)' }}
              title="Clear conversation"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={submit}
              disabled={busy}
              className="ares-btn w-[24px] h-[24px] flex items-center justify-center"
              style={{
                background: busy ? '#2a2a2a' : '#bdbdbd',
                color: '#101010',
                opacity: busy ? 0.6 : 1,
              }}
              title="Send"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] mt-2" style={{ color: 'var(--ares-muted)' }}>
        Ares can make mistakes. Fact-check anything important.
      </p>
    </div>
  );
};

export default Composer;
