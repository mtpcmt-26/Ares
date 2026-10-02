import React, { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ChatArea from '../components/ChatArea';
import Composer from '../components/Composer';
import BackgroundLayer from '../components/BackgroundLayer';
import CustomizeModal from '../components/modals/CustomizeModal';
import SettingsModal from '../components/modals/SettingsModal';
import ApiKeysModal from '../components/modals/ApiKeysModal';
import AuthModal from '../components/modals/AuthModal';
import Modal from '../components/modals/Modal';
import api, { API, authHeaders } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { GUEST_LIMIT } from '../lib/constants';
import { useCompactLayout, useVisualViewport } from '../hooks/useResponsiveLayout';

let uid = 0;
const nextId = () => `m${Date.now()}_${uid++}`;

const AresApp = () => {
  const { user, logout } = useAuth();
  const compact = useCompactLayout();
  useVisualViewport();
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia('(max-width: 1099px)').matches);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('normal');
  const [model, setModel] = useState('gpt-5');
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [imageMode, setImageMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [webEnabled, setWebEnabled] = useState(false);
  const [labsOn, setLabsOn] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [usage, setUsage] = useState({ used: 0, limit: GUEST_LIMIT, requires_login: false });
  const [modals, setModals] = useState({ customize: false, settings: false, keys: false, auth: false, account: false });
  const [authReason, setAuthReason] = useState('');
  const activeIdRef = useRef(null);

  useEffect(() => setSidebarOpen(!compact), [compact]);

  const openModal = (k, v = true) => setModals((m) => ({ ...m, [k]: v }));

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const loadUsage = useCallback(async () => {
    try {
      const { data } = await api.get('/usage');
      setUsage(data);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    api
      .get('/config')
      .then(({ data }) => setWebEnabled(!!data.web_search_enabled))
      .catch(() => setWebEnabled(false));
  }, []);

  useEffect(() => {
    loadConversations();
    loadUsage();
  }, [user, loadConversations, loadUsage]);

  const openConversation = async (id) => {
    if (compact) setSidebarOpen(false);
    setActiveId(id);
    activeIdRef.current = id;
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setMode(conv.mode || 'normal');
      setModel(conv.model || 'gpt-5');
    }
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  };

  const newChat = () => {
    if (compact) setSidebarOpen(false);
    setActiveId(null);
    activeIdRef.current = null;
    setMessages([]);
    setAttachment(null);
  };

  const deleteConversation = async (id) => {
    await api.delete(`/conversations/${id}`);
    if (id === activeIdRef.current) newChat();
    loadConversations();
  };

  const clearAll = async () => {
    await api.delete('/conversations');
    newChat();
    loadConversations();
    openModal('settings', false);
    toast({ title: 'All conversations cleared' });
  };

  const changeMode = async (m) => {
    setMode(m);
    if (activeIdRef.current) {
      await api.patch(`/conversations/${activeIdRef.current}`, { mode: m });
      loadConversations();
    }
  };

  const send = async (text) => {
    if (!user && usage.used >= usage.limit) {
      setAuthReason(`You have used all ${usage.limit} free messages. Log in to keep chatting with Ares.`);
      return openModal('auth');
    }

    const userMsg = { id: nextId(), role: 'user', content: text, image_b64: attachment };
    const aiMsg = { id: nextId(), role: 'assistant', content: '', citations: [] };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setStreamingId(aiMsg.id);
    setBusy(true);
    const sentAttachment = attachment;
    setAttachment(null);

    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: activeIdRef.current,
          text,
          mode,
          model,
          image_mode: imageMode,
          web_search: webSearch && webEnabled,
          attachment: sentAttachment,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id && m.id !== userMsg.id));
        setAuthReason(`Free limit reached (${GUEST_LIMIT} messages). Log in to continue.`);
        openModal('auth');
        return;
      }
      if (!res.ok || !res.body) throw new Error('request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          let ev;
          try {
            ev = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (ev.type === 'meta') {
            if (ev.conversation_id && ev.conversation_id !== activeIdRef.current) {
              activeIdRef.current = ev.conversation_id;
              setActiveId(ev.conversation_id);
            }
            loadConversations();
          } else if (ev.type === 'searching') {
            setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, searching: true } : m)));
          } else if (ev.type === 'delta') {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsg.id ? { ...m, searching: false, content: m.content + ev.content } : m))
            );
          } else if (ev.type === 'image') {
            setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, image_b64: ev.data } : m)));
          } else if (ev.type === 'citations') {
            setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, citations: ev.items } : m)));
          } else if (ev.type === 'error') {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content || `\u26a0 ${ev.message}` } : m))
            );
          }
        }
      }
      loadConversations();
      loadUsage();
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content || '\u26a0 Ares could not respond. Try again.' } : m))
      );
    } finally {
      setBusy(false);
      setStreamingId(null);
    }
  };

  const clearCurrent = () => {
    if (activeIdRef.current) return deleteConversation(activeIdRef.current);
    newChat();
  };

  const guestLeft = Math.max(0, usage.limit - usage.used);

  return (
    <div className="ares-root ares-app flex overflow-hidden" data-testid="ares-app">
      <Sidebar
        open={sidebarOpen}
        compact={compact}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onNew={newChat}
        onSelect={openConversation}
        onDelete={deleteConversation}
        onAccount={() => {
          if (compact) setSidebarOpen(false);
          if (user) openModal('account');
          else { setAuthReason(''); openModal('auth'); }
        }}
        onSettings={() => {
          if (compact) setSidebarOpen(false);
          openModal('settings');
        }}
        user={user}
        onLogout={async () => {
          await logout();
          newChat();
          loadConversations();
          loadUsage();
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col relative">
        <TopBar
          mode={mode}
          onMode={changeMode}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
          onOpenKeys={() => openModal('keys')}
          labsOn={labsOn}
          onLabs={() => {
            setLabsOn((o) => !o);
            toast({ title: labsOn ? 'Ares Labs off' : 'Ares Labs is coming soon' });
          }}
        />

        <div className="flex-1 min-h-0 flex flex-col relative">
          <BackgroundLayer />
          <div className="relative z-10 flex-1 min-h-0 flex flex-col">
            <ChatArea messages={messages} streamingId={streamingId} mode={mode} imageMode={imageMode} />
            {!user && (
              <div className="ares-guest-usage text-center" data-testid="guest-usage">
                <span className="ares-label">
                  {guestLeft} of {usage.limit} free messages left —{' '}
                  <button
                    data-testid="guest-login-button"
                    onClick={() => {
                      setAuthReason('');
                      openModal('auth');
                    }}
                    className="ares-btn underline"
                    style={{ color: 'var(--ares-accent)' }}
                  >
                    log in
                  </button>
                </span>
              </div>
            )}
            <Composer
              mode={mode}
              model={model}
              onModel={setModel}
              onSend={send}
              busy={busy}
              imageMode={imageMode}
              onImageMode={() => setImageMode((v) => !v)}
              webSearch={webSearch}
              onWebSearch={() => setWebSearch((v) => !v)}
              webEnabled={webEnabled}
              onClear={clearCurrent}
              attachment={attachment}
              onAttach={setAttachment}
              onRemoveAttachment={() => setAttachment(null)}
            />
          </div>
        </div>
      </div>

      <CustomizeModal open={modals.customize} onClose={() => openModal('customize', false)} />
      <SettingsModal
        open={modals.settings}
        onClose={() => openModal('settings', false)}
        onCustomize={() => {
          openModal('settings', false);
          openModal('customize');
        }}
        onClearAll={clearAll}
      />
      <ApiKeysModal
        open={modals.keys}
        onClose={() => openModal('keys', false)}
        user={user}
        onNeedLogin={() => {
          openModal('keys', false);
          setAuthReason('Log in to create Ares API keys.');
          openModal('auth');
        }}
      />
      <AuthModal open={modals.auth} onClose={() => openModal('auth', false)} reason={authReason} />
      <Modal
        open={modals.account}
        onClose={() => openModal('account', false)}
        title="Account"
        subtitle="Your Ares identity and plan."
        width={380}
      >
        <div className="space-y-2">
          {[
            ['Name', user?.name || '\u2014'],
            ['Email', user?.email || '\u2014'],
            ['Messages', 'Unlimited'],
          ].map(([k, v]) => (
            <div
              key={k}
              data-testid={`account-${k.toLowerCase()}`}
              className="flex flex-wrap gap-2 items-center justify-between px-3 py-2.5 break-words"
              style={{ border: '1px solid var(--ares-border-soft)' }}
            >
              <span className="ares-label">{k}</span>
              <span className="text-[12px] min-w-0 break-all" style={{ color: 'var(--ares-text)' }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default AresApp;
