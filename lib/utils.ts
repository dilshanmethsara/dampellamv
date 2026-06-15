import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: any, formatStr: string = 'MMM dd, yyyy') {
  if (!date) return 'N/A';
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, formatStr);
  } catch (e) {
    return 'N/A';
  }
}

export function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, Math.min(name.length, 2)).toUpperCase();
}

export function getNameColor(name: string) {
  const colors = [
    'bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 
    'bg-amber-600', 'bg-violet-600', 'bg-cyan-600', 'bg-fuchsia-600'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
