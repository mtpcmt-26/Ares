import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from './ui/dialog';
import { Plus, MessageSquare, User, Settings, Trash2, LogOut, X } from 'lucide-react';
import { modeById } from '../lib/constants';

const Sidebar = ({ open, compact, onClose, conversations, activeId, onNew, onSelect, onDelete, onAccount, onSettings, user, onLogout }) => {
  const content = (
    <>
      <div className="ares-sidebar-heading">
        <span className="text-sm" data-testid="sidebar-brand">ARES <span className="ares-label">by simpl.</span></span>
        {compact && <button className="ares-btn ares-icon-button" onClick={onClose} aria-label="Close navigation" data-testid="sidebar-close-button"><X size={18} /></button>}
      </div>
      <div className="px-3 pt-3">
        <button onClick={onNew} className="ares-btn ares-new-chat" data-testid="new-chat-button">
          <Plus size={16} /><span>New chat</span>
        </button>
      </div>
      <div className="px-4 pt-6 pb-3 ares-label">Conversations</div>
      <nav className="flex-1 min-h-0 overflow-y-auto ares-scroll" aria-label="Conversations" data-testid="conversation-list">
        {conversations.length === 0 && <p className="px-4 py-2 text-xs" style={{ color: 'var(--ares-muted)' }} data-testid="conversations-empty">No conversations yet.</p>}
        {conversations.map((c) => (
          <div className={`ares-conversation-row ${activeId === c.id ? 'is-active' : ''}`} key={c.id}>
            <button onClick={() => onSelect(c.id)} className="ares-conversation-select ares-btn" aria-current={activeId === c.id ? 'page' : undefined} data-testid={`conversation-select-${c.id}`}>
              <MessageSquare size={15} className="shrink-0 mt-1" style={{ color: modeById(c.mode).dot }} />
              <span className="min-w-0 text-left">
                <span className="block truncate text-xs" title={c.title}>{c.title}</span>
                <span className="ares-label block mt-1">{modeById(c.mode).label}</span>
              </span>
            </button>
            <button onClick={() => onDelete(c.id)} className="ares-btn ares-icon-button ares-delete-chat" aria-label={`Delete ${c.title}`} title="Delete conversation" data-testid={`conversation-delete-${c.id}`}><Trash2 size={14} /></button>
          </div>
        ))}
      </nav>
      <div className="ares-sidebar-footer">
        <button onClick={onAccount} className="ares-btn ares-sidebar-action" data-testid="sidebar-account-button"><User size={16} /><span className="truncate">{user ? user.name || user.email : 'Account'}</span></button>
        <button onClick={onSettings} className="ares-btn ares-sidebar-action" data-testid="sidebar-settings-button"><Settings size={16} />Settings</button>
        {user && <button onClick={onLogout} className="ares-btn ares-sidebar-action" data-testid="sidebar-logout-button"><LogOut size={16} />Log out</button>}
      </div>
    </>
  );

  if (compact) return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="ares-drawer-overlay" data-testid="sidebar-backdrop" />
        <DialogPrimitive.Content className="ares-root ares-sidebar ares-drawer" id="ares-sidebar" aria-describedby={undefined} data-testid="sidebar-drawer" onCloseAutoFocus={(e) => { e.preventDefault(); document.querySelector('[data-testid="sidebar-toggle-button"]')?.focus(); }}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          {content}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );

  return open ? <aside className="ares-sidebar" id="ares-sidebar" data-testid="sidebar-desktop">{content}</aside> : null;
};

export default Sidebar;