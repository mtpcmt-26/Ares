import React from 'react';
import { useAres } from '../context/AresContext';

const BackgroundLayer = () => {
  const { look } = useAres();
  if (look.background === 'topo') {
    return (
      <div className="bg-layer bg-topo">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
      </div>
    );
  }
  if (look.background === 'custom' && look.customBg) {
    return (
      <div
        className="bg-layer"
        style={{ backgroundImage: `url(${look.customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
    );
  }
  return <div className={`bg-layer bg-${look.background}`} />;
};

export default BackgroundLayer;
