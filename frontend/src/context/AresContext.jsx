import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fontById, ACCENTS } from '../lib/constants';

const AresContext = createContext(null);

const DEFAULTS = {
  font: 'mono',
  theme: 'dark',
  accent: 'orange',
  background: 'topo',
  customBg: null,
};

const load = () => {
  try {
    const raw = localStorage.getItem('ares_look');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

export const AresProvider = ({ children }) => {
  const [look, setLook] = useState(load);

  useEffect(() => {
    localStorage.setItem('ares_look', JSON.stringify(look));
    const root = document.documentElement;
    root.setAttribute('data-theme', look.theme);
    root.style.setProperty('--ares-font', fontById(look.font).stack);
    const accent = ACCENTS.find((a) => a.id === look.accent) || ACCENTS[3];
    root.style.setProperty('--ares-accent', accent.hex);
  }, [look]);

  const update = useCallback((patch) => setLook((p) => ({ ...p, ...patch })), []);
  const reset = useCallback(() => setLook(DEFAULTS), []);

  return (
    <AresContext.Provider value={{ look, update, reset }}>{children}</AresContext.Provider>
  );
};

export const useAres = () => useContext(AresContext);
