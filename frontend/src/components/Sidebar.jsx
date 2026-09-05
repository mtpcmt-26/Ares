import React from 'react';
import { Plus, MessageSquare, User, Settings as SettingsIcon, Trash2, LogOut } from 'lucide-react';
import { modeById } from '../lib/constants';

const Sidebar = ({
  open,
  conversations,
  activeId,
  onNew,
  onSelect,
  onDelete,
  onAccount,
  onSettings,
  user,
  onLogout,
}) => {
  return (
    <aside
      className="ares-scroll shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        width: open ? 204 : 0,
        borderRight: open ? '1px solid var(--ares-border-soft)' : 'none',
        background: 'var(--ares-panel)',
        transition: 'width 0.22s ease',
      }}
    >
      <div className="px-3 pt-3">
        <button
          onClick={onNew}
          className="ares-btn w-full flex items-center gap-2 px-3 py-2"
          style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ares-panel-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Plus size={12} />
          <span className="ares-label" style={{ color: 'var(--ares-text)' }}>
            New chat
          </span>
        </button>
      </div>

      <div className="px-4 pt-5 pb-2">
        <span className="ares-label">Conversations</span>
      </div>

      <div className="flex-1 overflow-y-auto ares-scroll pb-2">
        {conversations.length === 0 && (
          <div className="px-4 py-2 text-[11px]" style={{ color: 'var(--ares-muted)' }}>
            No conversations yet.
          </div>
        )}
        {conversations.map((c) => {
          const mode = modeById(c.mode);
          const active = c.id === activeId;
          return (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="ares-btn group relative cursor-pointer px-4 py-2.5 flex items-start gap-2"
              style={{
                background: active ? 'var(--ares-panel-2)' : 'transparent',
                borderLeft: active ? `2px solid var(--ares-accent)` : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <MessageSquare size={12} style={{ color: mode.dot, marginTop: 3, flexShrink: 0 }} />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px] leading-tight"
                  style={{ color: 'var(--ares-text)' }}
                  title={c.title}
                >
                  {c.title}
                </div>
                <div className="ares-label mt-1">{mode.label}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 ares-btn"
                style={{ color: 'var(--ares-muted)' }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--ares-border-soft)' }} className="py-2">
        <button
          onClick={onAccount}
          className="ares-btn w-full flex items-center gap-2 px-4 py-2 text-[12px]"
          style={{ color: 'var(--ares-text-dim)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ares-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ares-text-dim)')}
        >
          <User size={12} />
          <span className="truncate">{user ? user.name || user.email : 'Account'}</span>
        </button>
        <button
          onClick={onSettings}
          className="ares-btn w-full flex items-center gap-2 px-4 py-2 text-[12px]"
          style={{ color: 'var(--ares-text-dim)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ares-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ares-text-dim)')}
        >
          <SettingsIcon size={12} />
          <span>Settings</span>
        </button>
        {user && (
          <button
            onClick={onLogout}
            className="ares-btn w-full flex items-center gap-2 px-4 py-2 text-[12px]"
            style={{ color: 'var(--ares-text-dim)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ares-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ares-text-dim)')}
          >
            <LogOut size={12} />
            <span>Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
