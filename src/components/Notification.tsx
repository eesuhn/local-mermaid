'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const notificationVariants = cva(
  'fixed bottom-4 right-4 z-50 w-96 p-4 rounded-lg shadow-lg border',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'bg-red-100 text-red-800 border-red-300',
        success: 'bg-green-100 text-green-800 border-green-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface NotificationProps
  extends VariantProps<typeof notificationVariants> {
  title: string;
  description: string;
  className?: string;
}

export const Notification = ({
  title,
  description,
  variant,
  className,
}: NotificationProps) => {
  return (
    <Alert className={cn(notificationVariants({ variant }), className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0" />
        <div className="flex-grow">
          <AlertTitle className="mb-1 font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-sm">{description}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
