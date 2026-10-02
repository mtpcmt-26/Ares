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
      <div className="ares-empty-chat ares-scroll" data-testid="empty-chat">
        <div className="ares-chat-width">
          <div className="ares-label mb-3" data-testid="active-mode-label">&mdash; {m.label} mode active</div>
          <h1
            className="text-[42px] leading-none mb-4"
            style={{ color: 'var(--ares-text)' }}
            data-testid="chat-heading"
          >
            Ask Ares
          </h1>
          <p className="text-sm leading-[1.7] max-w-[420px]" style={{ color: 'var(--ares-text-dim)' }} data-testid="chat-mode-description">
            {imageMode ? 'What would you like to create?' : m.desc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto ares-scroll ares-chat-scroll" data-testid="chat-scroll">
      <div className="ares-chat-width ares-message-list">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} streaming={msg.id === streamingId} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatArea;
