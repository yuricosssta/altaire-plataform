// FrontEnd/src/app/(public)/termos-de-uso/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import { ROUTES } from "@/lib/constants/routes";

type LegalSection = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly content: readonly string[];
  readonly highlights?: readonly string[];
};

const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: "objeto-e-natureza",
    number: "01",
    title: "Objeto e Natureza da Plataforma",
    content: [
      "O Legion Altaire é um software sob a modalidade de Software como Serviço (SaaS), desenvolvido para fornecer infraestrutura estratégica e esteira operacional editorial orientada por inteligência artificial.",
      "A plataforma disponibiliza ambientes denominados Projetos Editoriais, onde o Usuário cadastra e persiste o contexto do seu negócio (Base Estratégica) para alimentar de forma encadeada a Linha Editorial, o Calendário de Publicações, a Biblioteca de Temas e a geração de Roteiros e Ativos de conteúdo.",
      "A plataforma atua estritamente como copiloto e acelerador operacional nos bastidores. O Legion Altaire não substitui o discernimento profissional, mercadológico ou legal do Usuário, cabendo a este a revisão humana, a curadoria e a decisão final sobre todo e qualquer material produzido antes de sua gravação, design ou veiculação pública.",
    ],
    highlights: [
      "Operação SaaS com contexto persistente por Projeto Editorial.",
      "A IA opera como suporte e esteira técnica, nunca como tomadora final de decisões.",
      "Responsabilidade editorial integral retida pelo Usuário.",
    ],
  },
  {
    id: "licenciamento-e-acesso",
    number: "02",
    title: "Licença de Uso, Assentos e Acesso",
    content: [
      "Mediante a contratação de um dos planos vigentes (Individual, Pro ou Agência & Escala), o Legion Altaire concede ao Usuário uma licença de uso temporária, revogável, não exclusiva e intransferível de acesso à plataforma durante a vigência da assinatura ativa.",
      "O acesso à conta é estritamente pessoal e protegido por credenciais criptografadas. O Usuário é o único responsável por manter a confidencialidade de sua senha de acesso e por qualquer atividade conduzida em sua conta.",
      "Nos planos que contemplam colaboração em equipe (assentos multi-usuário), cada assento deve ser atribuído a um operador nominal autorizado, sendo vedado o compartilhamento generalizado de senhas mestras entre terceiros estranhos à operação contratada.",
    ],
    highlights: [
      "Licença de uso temporária, não exclusiva e vinculada à assinatura ativa.",
      "Guarda e sigilo rigoroso das credenciais de acesso.",
      "Respeito ao limite de assentos e Projetos Editoriais contratados no plano.",
    ],
  },
  {
    id: "responsabilidades-do-usuario",
    number: "03",
    title: "Responsabilidades e Obrigações do Usuário",
    content: [
      "O Usuário declara e garante que todas as informações cadastradas na Base Estratégica — incluindo promessas comerciais, Propostas Únicas de Valor, informações de oferta e dados de público-alvo — são verídicas, legítimas e condizentes com a sua real capacidade técnica de entrega.",
      "É expressamente vedado utilizar o Legion Altaire para gerar, estruturar ou disseminar conteúdos que veiculem promessas fraudulentas, curas milagrosas, práticas comerciais abusivas, violações a direitos autorais de terceiros, discursos de ódio ou qualquer ato ilícito perante a legislação brasileira.",
      "O Usuário compromete-se a não realizar engenharia reversa, descompilação, ataques de injeção, sobrecarga de servidores ou qualquer tentativa de extração não autorizada do código-fonte, prompts de sistema internos ou da arquitetura proprietária do software.",
    ],
    highlights: [
      "Veracidade absoluta das informações cadastradas na Base Estratégica.",
      "Vedação expressa a conteúdos fraudulentos, abusivos ou ilícitos.",
      "Proibição irrevogável de engenharia reversa ou cópia da tecnologia proprietária.",
    ],
  },
  {
    id: "responsabilidades-do-legion-altaire",
    number: "04",
    title: "Responsabilidades e Garantias da Plataforma",
    content: [
      "O Legion Altaire compromete-se a empregar as melhores práticas de engenharia de software, segurança da informação e infraestrutura em nuvem para assegurar alta disponibilidade e estabilidade na prestação dos serviços.",
      "A plataforma não garante resultados comerciais, aumento automático de faturamento, volume de vendas ou alcance de métricas em redes sociais decorrentes da publicação dos conteúdos gerados, haja vista que o desempenho mercadológico depende da qualidade da oferta, da demanda de mercado, da consistência de distribuição e da execução comercial exclusiva do Usuário.",
      "Interrupções temporárias de serviço para manutenções preventivas, atualizações programadas de segurança ou instabilidades externas de provedores de nuvem e modelos de linguagem serão comunicadas tempestivamente, não caracterizando quebra contratual.",
    ],
    highlights: [
      "Compromisso com estabilidade, segurança e integridade operacional.",
      "Ausência de garantia sobre métricas de audiência ou vendas automáticas.",
      "Janelas de manutenção preventiva e segurança operacional.",
    ],
  },
  {
    id: "propriedade-intelectual",
    number: "05",
    title: "Propriedade Intelectual e Direitos sobre os Conteúdos",
    content: [
      "Propriedade da Plataforma: O código-fonte, design visual, tokens de design (--la-*), fluxos de interface, banco de dados, documentações e marcas registradas Legion Altaire pertencem exclusivamente à titular do software.",
      "Propriedade dos Conteúdos do Usuário: Todo o material de estratégia cadastrado na Base Estratégica, os anexos autorais e os roteiros finais gerados, editados e aprovados pelo Usuário dentro do software pertencem integralmente a este. O Legion Altaire não reivindica direitos autorais ou patrimoniais sobre as peças de comunicação publicadas pelo Usuário.",
      "Os dados corporativos e históricos do Projeto Editorial são tratados com estrito sigilo comercial e não são compartilhados com concorrentes nem utilizados para treinar modelos abertos de inteligência artificial sem autorização expressa.",
    ],
    highlights: [
      "Tecnologia, código e marca pertencem integralmente ao Legion Altaire.",
      "Conteúdos, temas e roteiros gerados pertencem exclusivamente ao Usuário.",
      "Blindagem e isolamento total de contexto entre diferentes clientes.",
    ],
  },
  {
    id: "planos-faturamento-e-cancelamento",
    number: "06",
    title: "Planos, Faturamento, Upgrades e Cancelamento",
    content: [
      "A contratação do Legion Altaire é formalizada mediante assinatura recorrente pré-paga no ciclo selecionado (Mensal ou Anual), sendo cobrada de forma automática através do gateway de pagamento seguro da plataforma.",
      "O Usuário pode solicitar a alteração de plano (upgrade ou downgrade) a qualquer momento diretamente pelo painel de configurações. No caso de upgrade, o novo limite de Projetos Editoriais e formatos é liberado imediatamente mediante o cálculo proporcional do período.",
      "O cancelamento da assinatura pode ser solicitado a qualquer momento pelo Usuário através do painel. Ao cancelar, o acesso à plataforma permanecerá ativo até o término do ciclo já quitado (mensal ou anual), inexistindo cobrança de multas rescisórias.",
    ],
    highlights: [
      "Assinatura recorrente com renovação automática no ciclo escolhido.",
      "Liberdade total para solicitar cancelamento sem multas pelo painel.",
      "Acesso preservado até o último dia do período já quitado.",
    ],
  },
  {
    id: "disposicoes-gerais-e-foro",
    number: "07",
    title: "Disposições Gerais, Alterações e Foro",
    content: [
      "O Legion Altaire reserva-se o direito de atualizar estes Termos de Uso periodicamente para refletir melhorias técnicas, lançamentos de novos módulos ou adequações legislativas. Alterações substanciais serão comunicadas aos assinantes ativos por e-mail ou aviso no painel com antecedência mínima de 15 (quinze) dias.",
      "Caso qualquer cláusula destes Termos seja considerada nula ou inexequível por decisão judicial, as demais cláusulas permanecerão plenamente válidas e eficazes.",
      "Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a resolução de eventuais controvérsias, fica eleito o foro da comarca da sede da operadora da plataforma, ressalvadas as prerrogativas de foro de domicílio do consumidor asseguradas pela legislação aplicável.",
    ],
    highlights: [
      "Avisos prévios sobre atualizações substanciais nos Termos.",
      "Preservação da validade integral das demais cláusulas contratuais.",
      "Eleição do Foro da comarca da sede da operadora da plataforma, ressalvadas as prerrogativas de foro de domicílio do consumidor.",
    ],
  },
] as const;

export default function TermosDeUsoPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    TERMS_SECTIONS[0].id
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of TERMS_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSectionId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col [overflow-anchor:none]">
      {/* 1. HERO INSTITUCIONAL DO DOCUMENTO */}
      <SectionShell
        id="termos-topo"
        ariaLabelledBy="termos-hero-title"
        container="wide"
        spacing="hero"
        surface="canvas"
        bottomBorder={true}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-14 left-1/2 -z-0 h-[26rem] w-[52rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.02)_48%,transparent_74%)] blur-3xl"
        />

        <div className="relative z-10 mx-auto flex max-w-[54rem] flex-col items-start gap-4">
          <SectionEyebrow
            label="DIRETRIZES CONTRATUAIS E USO DO SAAS"
            variant="pill"
          />

          <h1
            id="termos-hero-title"
            className="mt-2 text-balance font-la-sans text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.028em] text-la-text-primary"
          >
            Termos de Uso
          </h1>

          <div className="flex flex-wrap items-center gap-3 font-la-mono text-[0.75rem] text-la-text-secondary">
            <span>Última atualização: Outubro de 2026</span>
            <span aria-hidden="true">•</span>
            <span className="text-la-gold-light">Versão Contratual 2.4</span>
            <span aria-hidden="true">•</span>
            <span>Jurisdição: República Federativa do Brasil</span>
          </div>

          <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
            Estes Termos de Uso regulam o acesso e a utilização do Legion
            Altaire, estabelecendo os direitos, deveres, responsabilidades e
            limites operacionais aplicáveis a todos os assinantes, operadores e
            visitantes da plataforma.
          </p>

          <div className="mt-2 flex items-center gap-2.5 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-4 py-2.5">
            <Scale aria-hidden="true" className="h-4 w-4 shrink-0 text-la-gold" />
            <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
              Relação contratual transparente, justa e em conformidade com o Marco Civil da Internet.
            </span>
          </div>
        </div>
      </SectionShell>

      {/* 2. CORPO DO DOCUMENTO: SUMÁRIO RÁPIDO LATERAL + PROSE ESTRUTURADO */}
      <SectionShell
        id="termos-corpo"
        ariaLabel="Conteúdo dos Termos de Uso"
        container="wide"
        spacing="spacious"
        surface="surface-1"
        bottomBorder={false}
      >
        <div className="mx-auto grid w-full max-w-[68rem] grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* SUMÁRIO RÁPIDO LATERAL (STICKY NO DESKTOP) */}
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <div className="flex flex-col gap-3 rounded-la-xl border border-white/12 bg-[#07090F]/95 p-5 shadow-[var(--la-elevation-2)] backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <BookOpen aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Sumário das Cláusulas
                </span>
              </div>

              <nav
                aria-label="Sumário dos termos"
                className="flex flex-col gap-1.5"
              >
                {TERMS_SECTIONS.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={clsx(
                        "flex items-center justify-between rounded-la-md px-3 py-2 text-left font-la-sans text-[0.8125rem] transition-colors duration-180",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isActive
                          ? "border border-la-border-gold/55 bg-la-gold-faint font-semibold text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.12)]"
                          : "text-la-text-secondary hover:bg-white/[0.03] hover:text-la-text-primary"
                      )}
                    >
                      <span className="truncate">
                        {sec.number}. {sec.title}
                      </span>
                      {isActive ? (
                        <ArrowRight
                          aria-hidden="true"
                          className="h-3 w-3 shrink-0 text-la-gold"
                        />
                      ) : null}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-2 border-t border-white/10 pt-3">
                <Link
                  href={ROUTES.contato}
                  className="flex items-center justify-between rounded-la-md border border-white/10 bg-black/40 px-3 py-2 font-la-mono text-[0.6875rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
                >
                  <span>Dúvida contratual?</span>
                  <span className="text-la-gold-light">Falar com jurídico →</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* CLÁUSULAS DETALHADAS (PROSE ESTRUTURADO JUSTIFICADO) */}
          <div className="flex flex-col gap-12 lg:col-span-8">
            {TERMS_SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-la-xl border border-white/10 bg-[#090C14]/90 p-6 shadow-[var(--la-elevation-1)] sm:p-8"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.8125rem] font-semibold text-la-gold-light">
                    {section.number}
                  </span>
                  <h2 className="font-la-sans text-[1.25rem] font-semibold leading-[1.3] text-la-text-primary sm:text-[1.375rem]">
                    {section.title}
                  </h2>
                </div>

                <div className="mt-5 flex flex-col gap-3.5">
                  {section.content.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.72] text-la-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.highlights && section.highlights.length > 0 ? (
                  <div className="mt-6 rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Síntese de Conformidade da Cláusula {section.number}
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-2">
                      {section.highlights.map((hl) => (
                        <li
                          key={hl}
                          className="flex items-start gap-2.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-la-gold"
                          />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ))}

            {/* BOX FINAL DE ORIENTAÇÃO LEGAL */}
            <div className="rounded-la-xl border border-la-border-gold/45 bg-[#07090F]/95 p-6 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-[34rem] flex-col gap-1.5">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Canal Jurídico e Notificações
                  </span>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    Questões relativas à interpretação destes Termos, solicitações
                    de documentos societários ou notificações judiciais devem ser
                    encaminhadas diretamente ao nosso time através da página de
                    atendimento.
                  </p>
                </div>

                <Link
                  href={ROUTES.contato}
                  className="inline-flex min-h-[2.625rem] shrink-0 items-center justify-center rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  Abrir contato formal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}