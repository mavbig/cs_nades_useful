'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function KeyboardManager() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isTyping) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Global navigation
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        searchInput?.focus();
      }

      if (e.key === 'g' || e.key === 'Escape') {
        if (pathname !== '/') {
          e.preventDefault();
          router.push('/');
        }
      }

      // Home page specific (Arrow keys, Enter)
      if (pathname === '/') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:next-lineup'));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:prev-lineup'));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:select-lineup'));
        }
      }

      // Detail page specific (p, Delete)
      if (pathname.startsWith('/lineups/')) {
        if (e.key === 'p') {
          e.preventDefault();
          router.back();
        }
        if (e.key === 'Delete') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:delete-lineup'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);

  return null;
}
