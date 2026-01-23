import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Button from '../Button/Button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 text-center">{children}</div>
);
const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
);

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 h-8 w-8 p-0"
          aria-label="Cerrar diálogo"
        >
          <X className="w-4 h-4" />
        </Button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-portal')!
  );
};

export { Dialog, DialogHeader, DialogTitle };
