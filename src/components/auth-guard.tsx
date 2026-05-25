'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import { Loading } from '@/components/shared/molecules/loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { isMounted, isAuthenticated, user, viewMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAdmin && user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Admins viewing in user mode shouldn't be trapped in admin routes
    if (requireAdmin && user?.role === 'admin' && viewMode === 'user') {
      router.push('/');
    }
  }, [isMounted, isAuthenticated, user, viewMode, requireAdmin, router, pathname]);

  if (!isMounted) return <Loading fullScreen text="Verifying authentication..." />;

  if (!isAuthenticated) return null;

  if (requireAdmin && user?.role !== 'admin') return null;
  if (requireAdmin && viewMode === 'user') return null;

  return <>{children}</>;
}
