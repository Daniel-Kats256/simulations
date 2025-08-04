import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className={`${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
        <span className="text-lg">{icons[type]}</span>
        <p className="flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 font-bold text-lg"
        >
          
        </button>
      </div>
    </div>
  );
}