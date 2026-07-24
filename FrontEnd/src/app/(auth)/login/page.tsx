// src/app/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { loginUser, selectIsAuthenticated } from '@/lib/redux/slices/authSlice';
import { fetchMyOrganizations } from '@/lib/redux/slices/organizationSlice';
import Spinner from '@/components/Spinner';
import LogoBloco from '@/components/LogoBloco'; 
import { ComercialLogin } from '@/components/landing/ComercialLogin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { status, error } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Nota Arquitetural: Mantido o fetchMyOrganizations assumindo 
      // mapeamento futuro para "Workspaces" ou "Assinaturas" no escopo Altaire.
      dispatch(fetchMyOrganizations())
        .unwrap()
        .then(() => router.push('/dashboard'))
        .catch((err) => {
          console.error("Erro ao carregar workspace pós-login:", err);
          router.push('/dashboard'); 
        });
    }
  }, [isAuthenticated, dispatch, router]);

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background text-foreground">
      
      {/* LADO ESQUERDO: O Formulário Focado */}
      <div className="flex flex-col p-6 sm:p-12 lg:p-24 min-h-[100dvh] lg:min-h-screen">
        
        {/* Logo Mobile */}
        <div className="flex-none lg:hidden mb-8">
           <LogoBloco />
        </div>

        {/* Container Centralizado */}
        <div className="flex-1 flex flex-col justify-center mx-auto w-full sm:w-[380px] space-y-8 pb-12 lg:pb-0">
          
          <div className="flex flex-col space-y-2 text-left">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
              Acesso Restrito
            </h1>
            <p className="font-sans text-sm text-muted-foreground font-medium">
              Insira suas credenciais para acessar sua área de membros e gerenciar suas automações.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold leading-none text-muted-foreground uppercase tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                placeholder="admin@seudominio.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold leading-none text-muted-foreground uppercase tracking-wider">
                  Senha
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline transition-colors" tabIndex={-1}>
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center w-full h-12 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 mt-2 uppercase tracking-widest"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Autenticando...
                </span>
              ) : (
                'Entrar no Painel'
              )}
            </button>

            {error && (
              <div className="p-4 mt-4 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                Credenciais inválidas. Verifique os dados e tente novamente.
              </div>
            )}
          </form>

          {/* Rodapé do Formulário */}
          <p className="text-center font-sans text-sm text-muted-foreground">
            Ainda não faz parte da Altaire?{" "}
            <Link href="/signup" className="font-bold underline underline-offset-4 text-foreground hover:text-primary transition-colors">
              Aplicar para Formação.
            </Link>
          </p>

        </div>
      </div>

      {/* LADO DIREITO: Componente com Copywriting Comercial Altaire */}
      <ComercialLogin />
      
    </div>
  );
}