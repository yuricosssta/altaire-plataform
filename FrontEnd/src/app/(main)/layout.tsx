"use client";

import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, setAuthState } from '@/lib/redux/slices/authSlice';
import { fetchUserProfile } from '@/lib/redux/slices/userSlice';
import { fetchMyOrganizations } from '@/lib/redux/slices/organizationSlice';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifyOrRecoverSession() {
      if (isAuthenticated && currentToken) {
        if (active) setIsCheckingAuth(false);
        return;
      }

      // 1. Consulta o cookie de sessão no BFF (/api/auth/session) como fonte primária confiável
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.token) {
            localStorage.setItem('token', data.token);
            dispatch(setAuthState({ token: data.token }));
            dispatch(fetchUserProfile());
            dispatch(fetchMyOrganizations());
            if (active) setIsCheckingAuth(false);
            return;
          }
        }
      } catch {
        // Prossegue para fallback via localStorage
      }

      // 2. Fallback: verifica token válido no localStorage
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (storedToken) {
        dispatch(setAuthState({ token: storedToken }));
        const updatedToken =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (updatedToken) {
          dispatch(fetchUserProfile());
          dispatch(fetchMyOrganizations());
          if (active) setIsCheckingAuth(false);
          return;
        }
      }

      if (active) {
        setIsCheckingAuth(false);
        router.replace('/login');
      }
    }

    void verifyOrRecoverSession();

    return () => {
      active = false;
    };
  }, [isAuthenticated, currentToken, dispatch, router]);

  if (isCheckingAuth || !isAuthenticated) {
    return null;
  }

  return <div>{children}</div>;
}
