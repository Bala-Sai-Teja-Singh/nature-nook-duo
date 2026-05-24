'use client';

import { toast } from 'react-hot-toast';

/**
 * A simple wrapper around react-hot-toast to match the API signature 
 * you might expect if you were using Shadcn's use-toast hook.
 */
export function useToast() {
  return {
    toast: ({ title, description, variant }: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' | 'error' }) => {
      if (variant === 'destructive' || variant === 'error') {
        toast.error(description || title || 'An error occurred');
      } else if (variant === 'success') {
        toast.success(description || title || 'Success');
      } else {
        toast(description || title || 'Notification');
      }
    },
    dismiss: toast.dismiss,
  };
}
