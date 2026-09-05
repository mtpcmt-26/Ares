import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { modeById } from '../lib/constants';

const ChatArea = ({ messages, streamingId, mode, imageMode }) => {
  const endRef = useRef(null);
  const m = modeById(mode);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-start justify-center px-6 pt-[60px]">
        <div className="w-full max-w-[560px]">
          <div className="ares-label mb-3">&mdash; {m.label} mode active</div>
          <h1
            className="text-[42px] leading-none mb-4"
            style={{ color: 'var(--ares-text)', letterSpacing: '-0.02em' }}
          >
            Ask Ares
          </h1>
          <p className="text-[12px] leading-[1.7] max-w-[420px]" style={{ color: 'var(--ares-text-dim)' }}>
            {m.desc} Pick a mode above or {imageMode ? 'type a prompt to generate an image.' : 'toggle image mode to generate visuals.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto ares-scroll">
      <div className="w-full max-w-[570px] mx-auto px-4 pt-8 pb-4">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} streaming={msg.id === streamingId} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatArea;
