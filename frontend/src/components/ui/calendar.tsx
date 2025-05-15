// src/components/ui/calendar.tsx
'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Add custom tailwind styles as needed
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return <DayPicker className={cn('rounded-md border p-3', className)} {...props} />;
}
