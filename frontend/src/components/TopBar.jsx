import React, { useEffect, useRef, useState } from 'react';
import { PanelLeft, ChevronDown, FlaskConical, Sun, Moon, KeyRound, Check } from 'lucide-react';
import { MODES, modeById } from '../lib/constants';
import { useAres } from '../context/AresContext';

const TopBar = ({ mode, onMode, onToggleSidebar, sidebarOpen, onOpenKeys, onLabs, labsOn }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { look, update } = useAres();
  const current = modeById(mode);

  useEffect(() => {
    const dismiss = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const escape = (e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    if (open) { document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', escape); }
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);

  return (
    <header className="ares-topbar" data-testid="chat-header">
      <button onClick={onToggleSidebar} className="ares-btn ares-icon-button" aria-label="Toggle navigation" aria-expanded={sidebarOpen} aria-controls="ares-sidebar" title="Toggle navigation" data-testid="sidebar-toggle-button"><PanelLeft size={19} /></button>
      <div className="ares-brand" data-testid="header-brand">
        <div className="ares-brand-mark">A</div>
        <div><div className="text-[15px]">ARES</div><div className="ares-label">by simpl.</div></div>
      </div>
      <div ref={ref} className="ares-mode-picker">
        <button onClick={() => setOpen((o) => !o)} className="ares-btn ares-mode-trigger" aria-expanded={open} aria-controls="ares-modes" data-testid="mode-picker-button">
          <span className="ares-mode-dot" style={{ background: current.dot }} />
          <span className="text-left min-w-0"><span className="block text-xs">{current.label}</span><span className="ares-mode-tagline">{current.tagline}</span></span>
          <ChevronDown size={15} className={`ml-auto shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div id="ares-modes" className="ares-pop ares-mode-menu ares-scroll" data-testid="mode-picker-menu">
          {MODES.map((m) => <button key={m.id} onClick={() => { onMode(m.id); setOpen(false); ref.current?.querySelector('button')?.focus(); }} className="ares-btn ares-mode-option" aria-pressed={m.id === mode} data-testid={`mode-option-${m.id}`}>
            <span className="ares-mode-dot mt-1" style={{ background: m.dot }} />
            <span className="flex-1 text-left"><span className="block text-xs">{m.label} {m.badge && <small>{m.badge}</small>}</span><span className="block text-[11px] mt-1" style={{ color: 'var(--ares-text-dim)' }}>{m.desc}</span></span>
            {m.id === mode && <Check size={14} className="shrink-0" />}
          </button>)}
        </div>}
      </div>
      <div className="ares-topbar-actions">
        <button onClick={onOpenKeys} className="ares-btn ares-icon-button ares-keys-button" aria-label="Ares API keys" title="Ares API keys" data-testid="api-keys-button"><KeyRound size={17} /><span className="ares-label">API keys</span></button>
        <button onClick={onLabs} className="ares-btn ares-labs-button" aria-pressed={labsOn} title="Ares Labs" data-testid="labs-toggle-button"><FlaskConical size={15} /><span className="ares-label">Ares labs</span><span className={`ares-labs-indicator ${labsOn ? 'is-active' : ''}`} /></button>
        <button onClick={() => update({ theme: look.theme === 'light' ? 'dark' : 'light' })} className="ares-btn ares-icon-button" aria-label={look.theme === 'light' ? 'Use dark theme' : 'Use light theme'} title="Toggle theme" data-testid="theme-toggle-button">{look.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
      </div>
    </header>
  );
};

export default TopBar;