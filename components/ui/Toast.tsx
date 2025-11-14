
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '../icons';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 2700); // 3000ms total lifetime - 300ms for fade out

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed top-5 right-5 z-[200] flex items-center gap-3 p-4 rounded-lg shadow-2xl text-white font-semibold transition-all duration-300 ${bgColor} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <Icon className="w-6 h-6" />
      <span>{message}</span>
    </div>
  );
};
