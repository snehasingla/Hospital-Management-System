import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';

const NotificationToast = () => {
  try {
    const { realTimeNotification } = useNotification();

    if (!realTimeNotification) return null;

    const getIcon = () => {
      const { type } = realTimeNotification;
      if (type === 'appointment_booked') {
        return <FiBell className="w-5 h-5 text-blue-600" />;
      } else if (type === 'appointment_confirmed') {
        return <FiCheck className="w-5 h-5 text-green-600" />;
      } else if (type === 'appointment_rejected') {
        return <FiX className="w-5 h-5 text-red-600" />;
      } else if (type === 'appointment_rescheduled') {
        return <FiBell className="w-5 h-5 text-blue-600" />;
      }
      return <FiBell className="w-5 h-5 text-gray-600" />;
    };

    const getBgColor = () => {
      const { type } = realTimeNotification;
      if (type === 'appointment_booked') return 'bg-blue-50 border-blue-200';
      if (type === 'appointment_confirmed') return 'bg-green-50 border-green-200';
      if (type === 'appointment_rejected') return 'bg-red-50 border-red-200';
      if (type === 'appointment_rescheduled') return 'bg-yellow-50 border-yellow-200';
      return 'bg-gray-50 border-gray-200';
    };

    return (
      <div
        className={`fixed top-4 right-4 max-w-sm shadow-lg rounded-lg border-l-4 p-4 flex items-start gap-3 animate-slide-in z-50 ${getBgColor()}`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 text-sm">
            {realTimeNotification.title}
          </h3>
          <p className="text-gray-700 text-sm mt-1">{realTimeNotification.message}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in NotificationToast:', error);
    return null;
  }
};

export default NotificationToast;
