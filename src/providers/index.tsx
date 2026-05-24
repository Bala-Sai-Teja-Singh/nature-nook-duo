'use client';

import { ToastProvider } from './toast-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider />
      {children}
    </ThemeProvider>
  );
}
