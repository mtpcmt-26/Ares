import React from 'react';
import Modal from './Modal';
import { Palette, ChevronRight } from 'lucide-react';
import { useAres } from '../../context/AresContext';

const SettingsModal = ({ open, onClose, onCustomize, onClearAll }) => {
  const { look, update } = useAres();
  const dark = look.theme !== 'light';

  return (
    <Modal open={open} onClose={onClose} title="Settings" subtitle="Configure how Ares behaves and looks." width={400}>
      <button
        data-testid="settings-customize-button"
        onClick={onCustomize}
        className="ares-btn w-full flex items-center gap-3 px-3 py-3 mb-3 text-left"
        style={{ border: '1px solid var(--ares-border)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Palette size={14} style={{ color: 'var(--ares-text-dim)' }} />
        <span className="flex-1">
          <span className="block text-[12px]" style={{ color: 'var(--ares-text)' }}>
            Customize Ares
          </span>
          <span className="block text-[11px] mt-[3px]" style={{ color: 'var(--ares-muted)' }}>
            Font, theme, accent, background.
          </span>
        </span>
        <ChevronRight size={13} style={{ color: 'var(--ares-muted)' }} />
      </button>

      <div
        className="flex items-center gap-3 px-3 py-3 mb-3"
        style={{ border: '1px solid var(--ares-border)' }}
      >
        <span className="flex-1">
          <span className="block text-[12px]" style={{ color: 'var(--ares-text)' }}>
            Dark theme
          </span>
          <span className="block text-[11px] mt-[3px]" style={{ color: 'var(--ares-muted)' }}>
            Quick toggle (overridden by Customize).
          </span>
        </span>
        <button
          data-testid="settings-theme-toggle"
          aria-label="Dark theme"
          aria-pressed={dark}
          onClick={() => update({ theme: dark ? 'light' : 'dark' })}
          className="ares-btn ares-theme-switch shrink-0"
        >
          <span className="ares-theme-track" style={{ background: dark ? '#f2f2f2' : '#3a3a3a' }}><span style={{ transform: dark ? 'translateX(18px)' : 'none', background: dark ? '#111' : '#e8e8e8' }} /></span>
        </button>
      </div>

      <div className="flex items-center gap-3 px-3 py-3" style={{ border: '1px solid var(--ares-border)' }}>
        <span className="flex-1">
          <span className="block text-[12px]" style={{ color: 'var(--ares-text)' }}>
            Clear all conversations
          </span>
          <span className="block text-[11px] mt-[3px]" style={{ color: 'var(--ares-muted)' }}>
            Permanent. Cannot be undone.
          </span>
        </span>
        <button
          data-testid="settings-clear-all-button"
          onClick={onClearAll}
          className="ares-btn px-3 py-1.5 text-[12px] shrink-0"
          style={{ background: '#e5342f', color: '#fff' }}
        >
          Clear all
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
