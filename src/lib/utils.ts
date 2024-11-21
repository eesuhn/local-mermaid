import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  } as const;

  const time = date.toLocaleTimeString('en-GB', options);

  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();

  const daySuffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  return `${time}, ${day}${daySuffix} ${month} ${year}`;
}
