'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const pathname = usePathname();
  
  const links = [
    { href: '/events', label: 'Events' },
    { href: '/settings', label: 'Settings' },
    // Add more navigation links as needed
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname.startsWith(link.href) 
              ? 'text-black dark:text-white' 
              : 'text-muted-foreground'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}