// src/components/ui/form.tsx
'use client';

import * as React from 'react';
import {
  useFormContext,
  Controller,
  FormProvider,
  useFormState,
  type ControllerRenderProps,
  type ControllerFieldState,
  type UseFormStateReturn,
  type FieldValues,
  type UseControllerProps,
  type UseFormReturn,
  type Path,
} from 'react-hook-form';
import { cn } from '@/lib/utils';

// Typed Form component
export function Form<T extends FieldValues>({
  children,
  form,
}: {
  children: React.ReactNode;
  form: UseFormReturn<T>;
}) {
  return <FormProvider {...form}>{children}</FormProvider>;
}

interface FormFieldProps<T extends FieldValues> extends Omit<UseControllerProps<T>, 'render'> {
  render: (params: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => React.ReactElement;
}

export function FormField<T extends FieldValues>({ name, render, ...props }: FormFieldProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => render({ field, fieldState, formState })}
      {...props}
    />
  );
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium leading-none', className)} {...props} />;
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

interface FormMessageProps {
  name?: string;
  className?: string;
}

export function FormMessage({ name, className }: FormMessageProps) {
  const { errors } = useFormState();
  if (!name) return null;

  const error = errors[name];
  if (!error) return null;

  return (
    <p className={cn('text-sm font-medium text-destructive', className)}>
      {error?.message as string}
    </p>
  );
}
