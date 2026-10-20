import React, { useState, useCallback, createContext, useContext } from 'react';
import { Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as BsToast, ToastContainer as BsToastContainer } from 'react-bootstrap';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <BsToastContainer position="bottom-end" className="p-3 theme-toast-layer">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </BsToastContainer>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    onRemove(toast.id);
  };

  const getBgClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
      default:
        return 'bg-info';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check size={20} className="me-2" />;
      case 'error':
        return <AlertCircle size={20} className="me-2" />;
      case 'warning':
        return <AlertTriangle size={20} className="me-2" />;
      case 'info':
      default:
        return <Info size={20} className="me-2" />;
    }
  };

  return (
    <BsToast show={show} onClose={handleClose} delay={toast.duration || 5000} autohide>
      <BsToast.Body className={`${getBgClass()} text-white d-flex align-items-center`}>
        {getIcon()}
        {toast.message}
      </BsToast.Body>
    </BsToast>
  );
};
