import React from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  type = 'info',
  title,
  children,
  onClose,
}: AlertProps) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: '💙',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} border rounded-lg p-4`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3">{currentStyle.icon}</span>
        <div className="flex-1">
          {title && <h4 className="font-bold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
