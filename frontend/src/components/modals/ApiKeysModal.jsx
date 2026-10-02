import React, { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { Plus, Copy, Trash2 } from 'lucide-react';
import api, { API } from '../../lib/api';
import { toast } from '../../hooks/use-toast';

const ApiKeysModal = ({ open, onClose, user, onNeedLogin }) => {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState('');
  const [created, setCreated] = useState(null);

  const endpoint = `${API}/v1/ares`;
  const example = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer ares_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Explain quantum tunneling","mode":"short"}'`;

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/keys');
      setKeys(data);
    } catch {
      setKeys([]);
    }
  }, []);

  useEffect(() => {
    if (open && user) load();
  }, [open, user, load]);

  const create = async () => {
    if (!user) return onNeedLogin();
    if (!name.trim()) return;
    try {
      const { data } = await api.post('/keys', { name: name.trim() });
      setCreated(data.key);
      setName('');
      load();
    } catch {
      toast({ title: 'Could not create key' });
    }
  };

  const remove = async (id) => {
    await api.delete(`/keys/${id}`);
    load();
  };

  const copy = (v, label) => {
    navigator.clipboard.writeText(v);
    toast({ title: `${label} copied` });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ares API keys"
      subtitle="Create a key, then call Ares from any app. Keys are shown once \u2014 store them safely."
    >
      <div className="flex gap-2">
        <input
          data-testid="api-key-name-input"
          aria-label="Key name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          placeholder="Key name (e.g. my-project)"
          className="ares-input flex-1 min-w-0 bg-transparent outline-none px-3 py-2.5 text-[12px]"
          style={{ border: '1px solid var(--ares-accent)', color: 'var(--ares-text)' }}
        />
        <button
          data-testid="api-key-create-button"
          onClick={create}
          className="ares-btn flex items-center gap-2 px-4 text-[12px]"
          style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Plus size={12} /> Create
        </button>
      </div>

      {created && (
        <div className="mt-3 px-3 py-2.5" style={{ border: '1px solid var(--ares-accent)' }}>
          <div className="ares-label mb-1">New key (shown once)</div>
          <div className="flex items-center gap-2">
            <code data-testid="api-key-created-value" className="text-[11px] break-all flex-1 min-w-0" style={{ color: 'var(--ares-text)' }}>
              {created}
            </code>
            <button onClick={() => copy(created, 'Key')} aria-label="Copy new key" data-testid="api-key-copy-button" className="ares-btn ares-icon-button" style={{ color: 'var(--ares-text-dim)' }}>
              <Copy size={12} />
            </button>
          </div>
        </div>
      )}

      {!user ? (
        <p data-testid="api-keys-login-required" className="mt-3 text-[11px]" style={{ color: 'var(--ares-muted)' }}>
          Log in to create API keys.
        </p>
      ) : keys.length === 0 ? (
        <p data-testid="api-keys-empty" className="mt-3 text-[11px]" style={{ color: 'var(--ares-muted)' }}>
          No keys yet.
        </p>
      ) : (
        <div className="mt-3 space-y-1">
          {keys.map((k) => (
            <div
              key={k.id}
              data-testid={`api-key-${k.id}`}
              className="flex flex-wrap items-center gap-3 px-3 py-2"
              style={{ border: '1px solid var(--ares-border-soft)' }}
            >
              <span className="text-[12px] flex-1 min-w-0 break-all" style={{ color: 'var(--ares-text)' }}>
                {k.name}
              </span>
              <code className="text-[11px]" style={{ color: 'var(--ares-muted)' }}>
                {k.preview}
              </code>
              <button onClick={() => remove(k.id)} aria-label={`Delete ${k.name}`} data-testid={`api-key-delete-${k.id}`} className="ares-btn ares-icon-button" style={{ color: 'var(--ares-muted)' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 px-3 py-3" style={{ border: '1px solid var(--ares-border-soft)' }}>
        <div className="flex items-center justify-between">
          <span className="ares-label">Endpoint</span>
          <button
            data-testid="api-endpoint-copy-button"
            onClick={() => copy(endpoint, 'Endpoint')}
            className="ares-btn flex items-center gap-1 text-[11px]"
            style={{ color: 'var(--ares-text-dim)' }}
          >
            <Copy size={11} /> Copy
          </button>
        </div>
        <code data-testid="api-endpoint-value" className="block mt-2 text-[11px] break-all" style={{ color: 'var(--ares-text)' }}>
          {endpoint}
        </code>

        <div className="flex items-center justify-between mt-4">
          <span className="ares-label">Example</span>
          <button
            data-testid="api-example-copy-button"
            onClick={() => copy(example, 'Example')}
            className="ares-btn flex items-center gap-1 text-[11px]"
            style={{ color: 'var(--ares-text-dim)' }}
          >
            <Copy size={11} /> Copy
          </button>
        </div>
        <pre
          data-testid="api-example-code"
          className="mt-2 px-3 py-2.5 text-[10px] whitespace-pre-wrap ares-scroll"
          style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--ares-text-dim)' }}
        >
          {example}
        </pre>
        <p className="mt-3 text-[10px] leading-[1.6]" style={{ color: 'var(--ares-muted)' }}>
          Body: prompt or messages, optional mode (normal, 0-filter, people-pleaser, political, short) and model.
          Response: {'{ reply, mode, model }'}.
        </p>
      </div>
    </Modal>
  );
};

export default ApiKeysModal;
