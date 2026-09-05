import React, { useEffect, useRef, useState } from 'react';
import { PanelLeft, ChevronUp, ChevronDown, FlaskConical, Sun, Moon, KeyRound } from 'lucide-react';
import { MODES, modeById } from '../lib/constants';
import { useAres } from '../context/AresContext';

const TopBar = ({ mode, onMode, onToggleSidebar, onOpenKeys, onLabs, labsOn }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { look, update } = useAres();
  const current = modeById(mode);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header
      className="relative z-30 h-[52px] shrink-0 flex items-center px-4"
      style={{ borderBottom: '1px solid var(--ares-border-soft)', background: 'var(--ares-bg)' }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="ares-btn"
          style={{ color: 'var(--ares-text-dim)' }}
          title="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2" style={{ marginLeft: -170 }}>
        <div
          className="w-[26px] h-[26px] flex items-center justify-center text-[13px] font-semibold"
          style={{ background: '#f2f2f2', color: '#111' }}
        >
          A
        </div>
        <div className="leading-none">
          <div className="text-[15px] tracking-[0.12em]" style={{ color: 'var(--ares-text)' }}>
            ARES
          </div>
          <div className="ares-label mt-[3px]">by simpl.</div>
        </div>
      </div>

      {/* Mode selector */}
      <div ref={ref} className="absolute left-1/2 -translate-x-1/2" style={{ marginLeft: 130 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ares-btn w-[218px] flex items-center justify-between px-3 py-1.5"
          style={{ border: '1px solid var(--ares-border)', background: 'var(--ares-panel-2)' }}
        >
          <span className="flex items-start gap-2">
            <span
              className="w-[5px] h-[5px] rounded-full mt-[6px]"
              style={{ background: current.dot }}
            />
            <span className="text-left leading-none">
              <span className="block text-[11px] tracking-[0.12em]" style={{ color: 'var(--ares-text)' }}>
                {current.label}
              </span>
              <span className="block text-[10px] mt-[4px]" style={{ color: 'var(--ares-muted)' }}>
                {current.tagline}
              </span>
            </span>
          </span>
          {open ? (
            <ChevronUp size={14} style={{ color: 'var(--ares-muted)' }} />
          ) : (
            <ChevronDown size={14} style={{ color: 'var(--ares-muted)' }} />
          )}
        </button>

        {open && (
          <div
            className="ares-pop absolute left-0 top-[42px] w-[218px] py-1 z-40"
            style={{
              background: '#151515',
              border: '1px solid var(--ares-border)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
            }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onMode(m.id);
                  setOpen(false);
                }}
                className="ares-btn w-full text-left px-3 py-2 flex gap-2"
                style={{ background: m.id === mode ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    m.id === mode ? 'rgba(255,255,255,0.06)' : 'transparent')
                }
              >
                <span
                  className="w-[5px] h-[5px] rounded-full mt-[6px] shrink-0"
                  style={{ background: m.dot }}
                />
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] tracking-[0.12em]" style={{ color: 'var(--ares-text)' }}>
                      {m.label}
                    </span>
                    {m.badge && (
                      <span className="text-[9px]" style={{ color: 'var(--ares-muted)' }}>
                        {m.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[10px] mt-[3px] leading-[1.4]" style={{ color: 'var(--ares-muted)' }}>
                    {m.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={onOpenKeys}
          className="ares-btn flex items-center gap-2 px-2 py-1.5"
          style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text-dim)' }}
          title="Ares API keys"
        >
          <KeyRound size={12} />
          <span className="ares-label">API keys</span>
        </button>

        <div
          className="flex items-center gap-2 px-2 py-1.5"
          style={{ border: '1px solid var(--ares-border)' }}
        >
          <FlaskConical size={12} style={{ color: 'var(--ares-text-dim)' }} />
          <span className="ares-label">Ares labs</span>
          <button
            onClick={onLabs}
            className="ares-btn relative w-[30px] h-[16px] rounded-full"
            style={{ background: labsOn ? 'var(--ares-accent)' : '#3a3a3a' }}
            title="Ares Labs"
          >
            <span
              className="absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white"
              style={{ left: labsOn ? 16 : 2, transition: 'left 0.18s ease' }}
            />
          </button>
        </div>

        <button
          onClick={() => update({ theme: look.theme === 'light' ? 'dark' : 'light' })}
          className="ares-btn"
          style={{ color: 'var(--ares-text-dim)' }}
          title="Toggle theme"
        >
          {look.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
