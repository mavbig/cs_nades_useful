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

      // Home page specific (map selection / list, Arrow keys, Enter)
      if (pathname === '/') {
        if (e.key === 'g') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:goto-map-selection'));
        }
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

      // Detail page specific (p, g, Escape, Delete)
      if (pathname.startsWith('/lineups/')) {
        if (e.key === 'p' || e.key === 'Escape' || e.key === 'g') {
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
