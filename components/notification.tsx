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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'destructive':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'destructive':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${getStyles()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
