import { useEffect, useState } from 'react';

export const useCompactLayout = () => {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1099px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1099px)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return compact;
};

// Keep the composer and dialogs inside the visible area when a mobile keyboard opens.
export const useVisualViewport = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    const update = () => {
      if (viewport && viewport.scale !== 1) return;
      root.style.setProperty('--ares-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      root.style.setProperty('--ares-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      root.style.removeProperty('--ares-viewport-height');
      root.style.removeProperty('--ares-viewport-top');
    };
  }, []);
};