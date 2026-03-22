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
        if (e.key === 'Escape') {
          window.dispatchEvent(new CustomEvent('app:close-form'));
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
        if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
          window.dispatchEvent(new CustomEvent('app:utility-hotkey', { detail: { key: e.key } }));
        }
      }

      // Detail page specific (p, g, Escape, Delete)
      if (pathname.startsWith('/lineups/')) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app:toggle-media'));
        }
        if (e.key === 'Escape') {
          // Check if there is a form open by checking for an event listener that stops propagation
          // Or just let both happen? No, form should close first.
          // But KeyboardManager doesn't know if a form is open.
          // We'll let app:close-form handlers decide.
          window.dispatchEvent(new CustomEvent('app:close-form'));
        }
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
