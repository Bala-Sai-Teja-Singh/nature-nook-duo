'use client';

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #FAF7F2',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          fontFamily: 'var(--font-nunito), sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#2D5F2D',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#c53030',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};
