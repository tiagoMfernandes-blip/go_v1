import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useAppContext();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dismissNotification(notifications[0].id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, dismissNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 w-72">
      {notifications.map((notification) => {
        let bgColor = 'bg-gray-800';
        let textColor = 'text-white';
        let icon = null;

        switch (notification.type) {
          case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            icon = (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            );
            break;
          case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            icon = (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            );
            break;
          case 'warning':
            bgColor = 'bg-yellow-500';
            textColor = 'text-white';
            icon = (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            );
            break;
          case 'info':
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            icon = (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            );
            break;
        }

        return (
          <div
            key={notification.id}
            className={`${bgColor} ${textColor} rounded-lg shadow-lg mb-4 overflow-hidden animate-slide-in`}
            style={{
              animation: 'slideIn 0.3s ease-out forwards',
            }}
          >
            <div className="flex p-4">
              {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 ml-3 focus:outline-none"
              >
                <svg className="w-4 h-4 text-white opacity-70 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notifications; 
