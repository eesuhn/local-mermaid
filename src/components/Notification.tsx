'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface NotificationProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const Notification = ({
  title,
  description,
  className = 'fixed bottom-4 right-4 z-50 w-96',
  titleClassName = 'font-bold text-purple-900',
  descriptionClassName = 'ml-2',
}: NotificationProps) => {
  return (
    <Alert className={className}>
      <AlertTitle className={titleClassName}>{title}</AlertTitle>
      <AlertDescription className={descriptionClassName}>
        {description}
      </AlertDescription>
    </Alert>
  );
};
