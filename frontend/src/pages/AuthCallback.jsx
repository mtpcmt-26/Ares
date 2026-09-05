import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, guestId } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const run = async () => {
      const hash = window.location.hash || '';
      const sessionId = new URLSearchParams(hash.replace('#', '')).get('session_id');
      try {
        const { data } = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true, headers: { 'X-Guest-Id': guestId } }
        );
        if (data.token) localStorage.setItem('ares_token', data.token);
        setUser(data.user);
      } catch (e) {
        /* fall through to app */
      }
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/', { replace: true });
    };
    run();
  }, [navigate, setUser]);

  return (
    <div className="ares-root h-screen w-screen flex items-center justify-center">
      <span className="ares-label">Signing you in...</span>
    </div>
  );
};

export default AuthCallback;
