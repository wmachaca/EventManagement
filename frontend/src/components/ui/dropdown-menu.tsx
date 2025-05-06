// src/components/ui/dropdown-menu.tsx
'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import React from 'react';

// Root and Trigger remain the same
export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

// Improved Content component with better typing
export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownPrimitive.Content>, // Updated from ElementRef to ComponentRef
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content> & {
    className?: string;
    sideOffset?: number;
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
        'data-[side=top]:animate-slideDownAndFade',
        'data-[side=right]:animate-slideLeftAndFade',
        'data-[side=bottom]:animate-slideUpAndFade',
        'data-[side=left]:animate-slideRightAndFade',
        className
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

// Enhanced MenuItem with inset support
export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & {
    className?: string;
    inset?: boolean;
    disabled?: boolean;
  }
>(({ className, inset, disabled, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'transition-colors focus:bg-gray-100 focus:text-gray-900',
      inset && 'pl-8',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    disabled={disabled}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

// Improved MenuLabel with better semantics
export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-gray-900',
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// Enhanced Separator with better theming support
export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-gray-200', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// Optional: Add DropdownMenuGroup if needed
export const DropdownMenuGroup = DropdownPrimitive.Group;