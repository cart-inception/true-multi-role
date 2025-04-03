import React, { createContext, useContext, useState } from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const variantClasses = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-100 border-green-200 text-green-800',
  error: 'bg-red-100 border-red-200 text-red-800',
  warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  destructive: 'bg-red-100 border-red-200 text-red-800',
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 w-72 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-md p-4 shadow-md ${variantClasses[toast.variant || 'default']} relative`}
        >
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
          <h3 className="font-medium">{toast.title}</h3>
          {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
};
