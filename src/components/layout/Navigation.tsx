'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
  { href: '/search', label: 'Search' },
  { href: '/cart', label: 'Cart' },
  { href: '/store/details', label: 'Store Details' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/admin/dashboard', label: 'Admin Dashboard' },
  { href: '/admin/templates', label: 'Templates' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/seo', label: 'SEO' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-foreground">
          BookShop
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          ☰
        </button>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <Link href="/account/login" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/account/register"
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
      <div className={cn('border-t border-border bg-white md:hidden', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-2 px-4 py-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/account/login" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/account/register"
              className="rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
