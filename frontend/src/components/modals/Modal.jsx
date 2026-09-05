import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, subtitle, children, width = 500 }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ares-pop w-full max-h-[88vh] overflow-y-auto ares-scroll"
        style={{
          maxWidth: width,
          background: '#111111',
          border: '1px solid var(--ares-border)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        }}
      >
        <div className="px-5 pt-5 pb-4 relative">
          <button
            onClick={onClose}
            className="ares-btn absolute right-4 top-4"
            style={{ color: 'var(--ares-muted)' }}
          >
            <X size={14} />
          </button>
          <h2 className="text-[14px] tracking-[0.14em] uppercase" style={{ color: 'var(--ares-text)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] mt-1.5 leading-[1.6] pr-6" style={{ color: 'var(--ares-text-dim)' }}>
              {subtitle}
            </p>
          )}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
