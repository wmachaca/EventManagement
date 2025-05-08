// src/components/user-nav.tsx
'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Avatar} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export function UserNav({ user }: { user?: { name: string; email: string; image?: string } }) {
  const pathname = usePathname();
  const locale = useLocale();
  if (!user) return null; // Don't render anything if not logged in

  return (
    <div className="flex items-center gap-4">
      {/* Welcome Message */}
      <div className="hidden md:block">
        <p className="text-sm sm:text-base">
          Welcome, <span className="font-semibold">{user.name}</span>
        </p>
      </div>

      {/* Event Links */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <NavLink href={`/${locale}/events/myevents`} currentPath={pathname} label="My Events" />
        <NavLink href={`/${locale}/events`} currentPath={pathname} label="All Events" />
        <NavLink href={`/${locale}/events/create`} currentPath={pathname} label="Create Event" />
      </div>

      {/* Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar
  className="h-8 w-8"
  src={user.image || '/default-avatar.png'}
  alt={user.name}
  fallback={user.name
    .split(' ')
    .map((n) => n[0])
    .join('')}
/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Reuse the NavLink component
function NavLink({
  href,
  currentPath,
  label,
}: {
  href: string;
  currentPath: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors px-2 py-1 rounded ${
        currentPath.startsWith(href)
          ? 'bg-primary text-primary-foreground'
          : 'hover:text-primary text-muted-foreground'
      }`}
    >
      {label}
    </Link>
  );
}