// src/components/landing/ProductsSection.tsx
import { Cpu, BookOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ProductsSection() {
  const products = [
    {
      id: 'formacao',
      name: 'Formação Altaire',
      description: 'O mapa tático completo. Do absoluto zero à automação em vendas. Módulos focados em tráfego, copy e estruturação de ofertas irrecusáveis.',
      icon: BookOpen,
      features: ['Método Sequencial', 'Tráfego Pago Descomplicado', 'Estratégias de Copywriting'],
      cta: 'Conhecer Formação',
      href: '/produtos/formacao',
    },
    {
      id: 'software',
      name: 'SaaS / Acelerador IA',
      description: 'Automatize a geração de conteúdo e esteiras de vendas. O motor tecnológico para escalar sua produção sem esgotamento mental.',
      icon: Cpu,
      features: ['Geração de Roteiros e Copy', 'Templates de Alta Conversão', 'Gestão Centralizada'],
      cta: 'Testar Acelerador',
      href: '/produtos/software',
      highlight: true,
    },
    {
      id: 'comunidade',
      name: 'Mastermind & Networking',
      description: 'Ambiente de alto nível. Elimine a solidão do empreendedor digital conectando-se com quem já possui resultados comprovados.',
      icon: Users,
      features: ['Encontros de Mentoria', 'Análise de Projetos', 'Networking de Elite'],
      cta: 'Aplicar para Comunidade',
      href: '/produtos/comunidade',
    },
  ];

  return (
    <section id="produtos" className="bg-background px-6 py-24 sm:py-32 lg:px-8 border-b border-border">
      <div className="mx-auto max-w-2xl text-center mb-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          ECOSSISTEMA DE ESCALA
        </h2>
        <p className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          O Fim da Estagnação.
        </p>
        <p className="font-sans text-lg text-muted-foreground">
          Ferramentas, método e direcionamento. Tudo o que é necessário para construir liberdade geográfica e financeira em uma única infraestrutura.
        </p>
      </div>

      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className={`relative flex flex-col rounded-md border p-8 transition-colors ${
              product.highlight 
                ? 'border-primary bg-card/80 ring-1 ring-primary/20' 
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            {product.highlight && (
              <span className="absolute -top-3 left-8 inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                Motor Principal
              </span>
            )}
            
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
              <product.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            
            <h3 className="font-subheading text-2xl font-bold text-foreground mb-3">
              {product.name}
            </h3>
            
            <p className="font-sans text-muted-foreground mb-8 flex-grow">
              {product.description}
            </p>
            
            <ul className="mb-8 space-y-3 font-sans text-sm text-muted-foreground">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={product.href}
              className={`inline-flex h-12 w-full items-center justify-center rounded-md px-6 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                product.highlight
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              {product.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}