import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Button from '../Button/Button.tsx';

interface DocumentViewerProps {
  url: string;
  onClose: () => void;
}

const DocumentViewer = ({ url, onClose }: DocumentViewerProps) => {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-11/12 h-5/6 max-w-5xl bg-white rounded-lg shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b bg-slate-50 rounded-t-lg">
          <h3 className="font-semibold text-slate-700">Visor de Documento</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose()}
            className="absolute top-3 right-3 h-8 w-8 p-0"
            aria-label="Cerrar visor de documentos"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <iframe
          src={url}
          title="Visor de Documento"
          className="w-full h-full border-0 rounded-b-lg"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>,
    document.getElementById('modal-portal')!
  );
};

export default DocumentViewer;
