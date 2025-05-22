import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  title,
  autoClose = true,
  duration = 5000,
  onClose
}) => {
  const { theme } = useAppContext();
  const [isVisible, setIsVisible] = useState(true);
  
  // Define os estilos baseados no tipo de alerta
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: theme === 'dark' ? 'bg-green-900' : 'bg-green-100',
          borderColor: 'border-green-500',
          textColor: theme === 'dark' ? 'text-green-200' : 'text-green-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: theme === 'dark' ? 'bg-red-900' : 'bg-red-100',
          borderColor: 'border-red-500',
          textColor: theme === 'dark' ? 'text-red-200' : 'text-red-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100',
          borderColor: 'border-yellow-500',
          textColor: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bgColor: theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100',
          borderColor: 'border-blue-500',
          textColor: theme === 'dark' ? 'text-blue-200' : 'text-blue-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };
  
  const typeStyles = getTypeStyles();
  
  // Fechar o alerta automaticamente após um tempo
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`${typeStyles.bgColor} border-l-4 ${typeStyles.borderColor} p-4 shadow-md rounded-md mb-4 flex items-start`}>
      <div className="flex-shrink-0 mr-3">
        {typeStyles.icon}
      </div>
      <div className="flex-grow">
        {title && <div className={`font-bold ${typeStyles.textColor}`}>{title}</div>}
        <div className={typeStyles.textColor}>{message}</div>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className={`flex-shrink-0 ${typeStyles.textColor} hover:text-opacity-75 focus:outline-none`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Alert; 