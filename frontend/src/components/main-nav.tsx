// src/components/main-nav.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function MainNav({ className }: { className?: string }) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <Link href="/" className="flex items-center">
        <Image
          src="/ratherLogo.jpg"
          alt="Company Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <span className="font-bold text-lg hidden sm:inline-block">EventPro</span>
      </Link>
    </div>
  );
}