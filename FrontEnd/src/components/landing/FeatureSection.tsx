// src/components/landing/FeatureSection.tsx
import { Map, Clock, ShieldCheck } from 'lucide-react';

export function FeatureSection() {
  const features = [
    {
      title: 'Direcionamento Estruturado',
      description: 'Acesse um mapa tático do zero ao faturamento. Elimine a sobrecarga de informações com um método sequencial, sem margem para procrastinação.',
      icon: Map
    },
    {
      title: 'Máquina de Vendas Contínua',
      description: 'Estruture funis e automações que convertem visitantes em clientes 24/7. Escale resultados e proteja seu tempo livre sem depender de esforço manual.',
      icon: Clock
    },
    {
      title: 'Estratégias Validadas',
      description: 'Evite testes cegos e promessas irreais. Implemente processos de tráfego e copy já testados no mercado, blindando sua operação contra o amadorismo.',
      icon: ShieldCheck
    },
  ];

  return (
    <section id="recursos" className="bg-background px-6 py-24 sm:py-32 lg:px-8 border-b border-border">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          MÉTODO ALTAIRE
        </h2>
        <p className="font-subheading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Arquitetura para a Escala Digital
        </p>
      </div>
      
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3 lg:grid lg:gap-x-8">
        {features.map((feature) => (
          <div 
            key={feature.title} 
            className="flex flex-col bg-card p-8 rounded-md mb-8 lg:mb-0 border border-border transition-colors hover:border-primary/50"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
              <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <dt className="font-subheading text-xl font-bold text-foreground">
              {feature.title}
            </dt>
            <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-muted-foreground">
              <p className="flex-auto font-sans">{feature.description}</p>
            </dd>
          </div>
        ))}
      </div>
    </section>
  );
}