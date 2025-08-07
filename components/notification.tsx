'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { NotificationProps } from '@/types/notification';

export function Notification({
  variant = 'default',
  title,
  description,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="mt-1 h-4 w-4 text-green-700" />;
      case 'destructive':
        return <XCircle className="mt-1 h-4 w-4 text-red-700" />;
      case 'warning':
        return <AlertCircle className="mt-1 h-4 w-4 text-yellow-700" />;
      default:
        return <Info className="mt-1 h-4 w-4 text-blue-700" />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50/90 border-green-200/90 backdrop-blur-sm';
      case 'destructive':
        return 'bg-red-50/90 border-red-200/90 backdrop-blur-sm';
      case 'warning':
        return 'bg-yellow-50/90 border-yellow-200/90 backdrop-blur-sm';
      default:
        return 'bg-blue-50/90 border-blue-200/90 backdrop-blur-sm';
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${getStyles()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {description && (
              <p className="mt-1 ml-[1px] text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
