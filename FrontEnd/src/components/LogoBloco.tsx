// FrontEnd/src/components/LogoBloco.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';

interface LogoBlocoProps {
    /** Define a orientação do logo: lado a lado (horizontal) ou empilhado (vertical) */
    orientation?: 'horizontal' | 'vertical';
}

export default function LogoBloco({ orientation = 'horizontal' }: LogoBlocoProps) {
    const isVertical = orientation === 'vertical';

    return (
        <div>
            <Link href="/dashboard" className="group">
                {/* Contêiner Principal */}
                <div className={`flex ${isVertical ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-3`}>
                    
                    {/* Imagem do Logo */}
                    <div className={`relative ${isVertical ? 'w-16 h-16' : 'w-11 h-11'} transition-transform duration-300 group-hover:scale-105`}>
                        <Image
                            src="/logo-altaire.png"
                            alt="Logo Altaire Legion"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Texto do Logo */}
                    <div className={`flex flex-col ${isVertical ? 'items-center mt-1' : 'items-start'} justify-center transition-colors duration-300 group-hover:text-primary`}>
                        <span className={`font-bold uppercase tracking-widest text-foreground ${isVertical ? 'text-2xl' : 'text-xl'} leading-none`}>
                            ALTAIRE
                        </span>
                        <span className={`uppercase text-muted-foreground tracking-widest ${isVertical ? 'text-sm mt-1' : 'text-xs mt-0.5'} leading-none`}>
                            LEGION
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}