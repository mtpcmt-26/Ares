import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ open, onClose, reason }) => {
  const { login, signup, googleLogin } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
      onClose();
    } catch (ex) {
      setErr(ex?.response?.data?.detail || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const field = (key, placeholder, type = 'text') => (
    <input
      value={form[key]}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder}
      type={type}
      className="ares-input w-full bg-transparent outline-none px-3 py-2.5 text-[12px] mb-2"
      style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text)' }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ares-accent)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ares-border)')}
    />
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === 'login' ? 'Log in to Ares' : 'Create your Ares account'}
      subtitle={reason || 'Save conversations across devices and unlock unlimited messages.'}
      width={400}
    >
      <div className="flex gap-2 mb-4">
        {['login', 'signup'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="ares-btn flex-1 py-2 text-[11px] tracking-[0.12em] uppercase"
            style={{
              border: `1px solid ${tab === t ? '#5a5a5a' : 'var(--ares-border-soft)'}`,
              background: tab === t ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: 'var(--ares-text)',
            }}
          >
            {t === 'login' ? 'Log in' : 'Sign up'}
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        {tab === 'signup' && field('name', 'Name')}
        {field('email', 'Email', 'email')}
        {field('password', 'Password', 'password')}
        {err && (
          <p className="text-[11px] mb-2" style={{ color: '#ef6b64' }}>
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="ares-btn w-full py-2.5 text-[12px]"
          style={{ background: 'var(--ares-accent)', color: '#fff', opacity: busy ? 0.6 : 1 }}
        >
          {tab === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <span className="flex-1 h-px" style={{ background: 'var(--ares-border)' }} />
        <span className="ares-label">or</span>
        <span className="flex-1 h-px" style={{ background: 'var(--ares-border)' }} />
      </div>

      <button
        onClick={googleLogin}
        className="ares-btn w-full py-2.5 text-[12px] flex items-center justify-center gap-2"
        style={{ border: '1px solid var(--ares-border)', color: 'var(--ares-text)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <svg width="14" height="14" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.6c-.3 2.1-1.6 5.2-4.6 7.3l7.6 5.9c4.5-4.2 6.5-10.2 6.5-17.5z" />
          <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15.1-5.5l-7.6-5.9c-2 1.4-4.7 2.4-7.5 2.4-6.3 0-11.7-3.8-13.6-9.3l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>
    </Modal>
  );
};

export default AuthModal;
