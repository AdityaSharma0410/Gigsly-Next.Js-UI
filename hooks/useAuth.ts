'use client';

import { useAuth as useAuthContext } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Re-export useAuth from AuthContext
export { useAuth } from '@/lib/contexts/AuthContext';

export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: string[], redirectUrl = '/') {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push(redirectUrl);
      }
    }
  }, [user, isAuthenticated, isLoading, router, allowedRoles, redirectUrl]);

  return { user, isLoading, hasAccess: user ? allowedRoles.includes(user.role) : false };
}
