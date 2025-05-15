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
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

// Typed Form component
export function Form<T extends FieldValues>({
  children,
  form,
  onSubmit,
  className,
}: {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  return (
    // <-- You were missing this
    <FormProvider {...form}>
      <form onSubmit={onSubmit ?? form.handleSubmit(() => {})} className={className}>
        {children}
      </form>
    </FormProvider>
  );
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

export interface FormControlProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp ref={ref} className={cn(className)} {...props} />;
  },
);

FormControl.displayName = 'FormControl';

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
