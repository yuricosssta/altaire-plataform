// FrontEnd/src/components/LogoBloco.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoBlocoProps {
  /** Define a orientação do logo: lado a lado (horizontal) ou empilhado (vertical) */
  orientation?: 'horizontal' | 'vertical';
  /** Classes adicionais para injeção de estilos externos */
  className?: string;
}

export default function LogoBloco({ orientation = 'horizontal', className }: LogoBlocoProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={cn("inline-block", className)}>
      <Link 
        href="/" 
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <div className={cn(
          "flex items-center gap-3 transition-opacity hover:opacity-90",
          isVertical ? "flex-col text-center" : "flex-row"
        )}>
          
          {/* Container da Imagem - Responsivo ao Tema (Dark/Light) */}
          <div className={cn(
            "relative transition-transform duration-300 group-hover:scale-105",
            isVertical ? "w-16 h-16" : "w-11 h-11"
          )}>
            {/* Asset para Tema Claro (Fundo Branco/Gelo) */}
            <Image
              src="/logo-altaire.png"
              alt="Logo Altaire"
              fill
              className="object-contain block dark:hidden"
              priority
            />
            {/* Asset para Tema Escuro (Fundo Preto Dominante) */}
            <Image
              src="/logo-altaire.png"
              alt="Logo Altaire"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </div>

          {/* Tipografia da Marca */}
          <div className={cn(
            "flex flex-col justify-center transition-colors duration-300 group-hover:text-primary",
            isVertical ? "items-center mt-1" : "items-start"
          )}>
            <span className={cn(
              "font-heading font-bold uppercase tracking-widest text-foreground leading-none",
              isVertical ? "text-2xl" : "text-xl"
            )}>
              ALTAIRE
            </span>
            <span className={cn(
              "font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground leading-none",
              isVertical ? "text-sm mt-1.5" : "text-[10px] mt-1"
            )}>
              LEGION
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}