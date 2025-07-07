import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { errorHandler, NotificationOptions } from '../utils/errorHandling';

interface NotificationProps extends NotificationOptions {
  id: string;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  persistent, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDarkColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30 text-green-100';
      case 'error':
        return 'bg-red-900/20 border-red-500/30 text-red-100';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-100';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-100';
      default:
        return 'bg-gray-900/20 border-gray-500/30 text-gray-100';
    }
  };

  return (
    <div
      className={`
        max-w-md w-full border backdrop-blur-sm rounded-lg p-4 shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getDarkColorClasses()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<(NotificationOptions & { id: string })[]>([]);

  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((newNotifications) => {
      setNotifications(newNotifications.map(n => ({ ...n, id: (n as any).id })));
    });

    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    errorHandler.removeNotification(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default NotificationSystem; 