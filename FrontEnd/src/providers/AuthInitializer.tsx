//src/providers/AuthInitializer.tsx
"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthState } from '../lib/redux/slices/authSlice';
import { fetchUserProfile } from '../lib/redux/slices/userSlice';
import { AppDispatch, store } from '../lib/redux/store';
import { fetchMyOrganizations } from '@/lib/redux/slices/organizationSlice';
import { SessionExpiredModal } from '@/components/auth/SessionExpiredModal';
import { SessionWarningModal } from '@/components/auth/SessionWarningModal';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      dispatch(setAuthState({ token }));
      // Só busca perfil e organizações se o token decodificado for válido e não expirado
      if (store.getState().auth.isAuthenticated) {
        dispatch(fetchUserProfile());
        dispatch(fetchMyOrganizations());
      }
    }
  }, [dispatch]);

  return (
    <>
      <SessionWarningModal />
      <SessionExpiredModal />
      {children}
    </>
  );
}
