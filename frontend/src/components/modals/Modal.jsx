import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';

const Modal = ({ open, onClose, title, subtitle, children, width = 500 }) => {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent
        className="ares-root ares-modal-surface ares-scroll"
        style={{ '--ares-modal-width': `${width}px` }}
        data-testid={`modal-${id}`}
        closeTestId={`modal-${id}-close`}
        onOpenAutoFocus={(e) => { e.preventDefault(); e.currentTarget?.focus(); }}
      >
        <div className="ares-modal-heading">
          <DialogTitle data-testid={`modal-${id}-title`}>{title}</DialogTitle>
          <DialogDescription className={subtitle ? 'ares-modal-description' : 'sr-only'} data-testid={`modal-${id}-description`}>{subtitle || title}</DialogDescription>
        </div>
        <div className="ares-modal-body">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;