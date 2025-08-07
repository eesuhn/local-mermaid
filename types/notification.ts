export interface NotificationVariantProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export interface NotificationProps extends NotificationVariantProps {
  title: string;
  description?: string;
}
