import React, { useEffect, useMemo } from 'react';
import { Alert as BsAlert } from 'react-bootstrap';
import { Notification } from '../types';

interface AlertProps {
  notification?: Notification | null;
  onClose?: () => void;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  className?: string;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  notification,
  onClose = () => {},
  message,
  type = 'info',
  className = '',
  duration = 3000,
}) => {
  const displayNotification = useMemo(
    () => notification || (message ? { id: '1', type: type as any, message, duration } : null),
    [notification, message, type, duration]
  );

  useEffect(() => {
    if (displayNotification && onClose) {
      const timer = setTimeout(onClose, displayNotification.duration || duration);
      return () => clearTimeout(timer);
    }
  }, [displayNotification, onClose, duration]);

  if (!displayNotification) return null;

  const typeMap = {
    success: 'success',
    error: 'danger',
    info: 'info',
    warning: 'warning',
  };

  const notificationType = displayNotification.type as keyof typeof typeMap;

  return (
    <BsAlert
      variant={typeMap[notificationType]}
      onClose={onClose}
      dismissible
      className={`rounded-3 ${className}`}
    >
      {displayNotification.message}
    </BsAlert>
  );
};

export default Alert;
