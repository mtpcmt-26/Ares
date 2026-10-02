import React, { useRef } from 'react';
import Modal from './Modal';
import { Check, RotateCcw, Upload } from 'lucide-react';
import { FONTS, THEMES, ACCENTS, BACKGROUNDS, fontById } from '../../lib/constants';
import { useAres } from '../../context/AresContext';

const Section = ({ label, children }) => (
  <div className="mb-6">
    <div className="ares-label mb-2">{label}</div>
    {children}
  </div>
);

const CustomizeModal = ({ open, onClose }) => {
  const { look, update, reset } = useAres();
  const fileRef = useRef(null);

  const upload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => update({ background: 'custom', customBg: String(r.result) });
    r.readAsDataURL(f);
    e.target.value = '';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customize Ares"
      subtitle="Make Ares look the way you want. Changes apply instantly."
    >
      <Section label="Font">
        <div className="ares-customize-grid">
          {FONTS.map((f) => {
            const active = look.font === f.id;
            return (
              <button
                key={f.id}
                data-testid={`customize-font-${f.id}`}
                aria-pressed={active}
                onClick={() => update({ font: f.id })}
                className="ares-btn py-3 flex flex-col items-center gap-2"
                style={{
                  border: `1px solid ${active ? '#5a5a5a' : 'var(--ares-border-soft)'}`,
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                <span className="text-[15px] leading-none" style={{ fontFamily: f.stack, color: 'var(--ares-text)' }}>
                  Aa
                </span>
                <span className="ares-label" style={{ fontSize: 8 }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="mt-3 px-3 py-3 text-[12px]"
          data-testid="customize-font-preview"
          style={{
            border: '1px solid var(--ares-border-soft)',
            fontFamily: fontById(look.font).stack,
            color: 'var(--ares-text)',
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </div>
      </Section>

      <Section label="Theme">
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => {
            const active = look.theme === t.id;
            return (
              <button
                key={t.id}
                data-testid={`customize-theme-${t.id}`}
                aria-pressed={active}
                onClick={() => update({ theme: t.id })}
                className="ares-btn py-2.5 flex items-center justify-center gap-2 text-[12px]"
                style={{
                  border: `1px solid ${active ? '#5a5a5a' : 'var(--ares-border-soft)'}`,
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: 'var(--ares-text)',
                }}
              >
                {active && <Check size={11} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Accent color">
        <div className="ares-accent-options">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              data-testid={`customize-accent-${a.id}`}
              aria-label={`${a.id} accent`}
              aria-pressed={look.accent === a.id}
              title={`${a.id} accent`}
              onClick={() => update({ accent: a.id })}
              className="ares-btn ares-accent-swatch flex items-center justify-center"
              style={{ '--swatch': a.hex }}
            >
              {look.accent === a.id && <Check size={13} color="#fff" />}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Background">
        <div className="ares-customize-grid">
          {BACKGROUNDS.map((b) => {
            const active = look.background === b.id;
            return (
              <button
                key={b.id}
                data-testid={`customize-background-${b.id}`}
                aria-label={`${b.label} background`}
                aria-pressed={active}
                onClick={() => update({ background: b.id })}
                className="ares-btn relative overflow-hidden"
                style={{ border: `1px solid ${active ? 'var(--ares-accent)' : 'var(--ares-border-soft)'}`, height: 72 }}
              >
                <span className={`absolute inset-0 bg-${b.id}`} />
                {active && (
                  <span className="absolute right-1 top-1 w-[14px] h-[14px] rounded-full bg-white flex items-center justify-center">
                    <Check size={9} color="#111" />
                  </span>
                )}
                <span
                  className="absolute left-0 right-0 bottom-0 text-center py-[2px]"
                  style={{ background: 'rgba(0,0,0,0.55)', fontSize: 7, letterSpacing: '0.1em', color: '#e8e8e8' }}
                >
                  {b.label}
                </span>
              </button>
            );
          })}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} data-testid="customize-background-upload-input" aria-label="Upload background" />
          <button
            data-testid="customize-background-upload-button"
            aria-label="Upload background"
            onClick={() => fileRef.current?.click()}
            className="ares-btn relative flex items-center justify-center"
            style={{ border: '1px solid var(--ares-border-soft)', height: 62 }}
          >
            <Upload size={14} style={{ color: 'var(--ares-text-dim)' }} />
            <span
              className="absolute left-0 right-0 bottom-0 text-center py-[2px]"
              style={{ background: 'rgba(0,0,0,0.55)', fontSize: 7, letterSpacing: '0.1em', color: '#e8e8e8' }}
            >
              UPLOAD
            </span>
          </button>
        </div>
      </Section>

      <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--ares-border-soft)' }}>
        <button
          data-testid="customize-reset-button"
          onClick={reset}
          className="ares-btn mt-4 flex items-center gap-2 px-3 py-2 text-[12px]"
          style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <RotateCcw size={12} />
          Reset to default
        </button>
      </div>
    </Modal>
  );
};

export default CustomizeModal;
