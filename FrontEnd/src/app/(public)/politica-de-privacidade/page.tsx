// FrontEnd/src/app/(public)/politica-de-privacidade/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Eye,
  FileCheck2,
  KeyRound,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import { ROUTES } from "@/lib/constants/routes";

type PrivacySection = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly content: readonly string[];
  readonly principles?: readonly string[];
};

const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    id: "fundamento-e-escopo",
    number: "01",
    title: "Fundamentos Legais e Papéis da LGPD",
    content: [
      "Esta Política de Privacidade estabelece o compromisso inegociável do Legion Altaire com a proteção de dados pessoais, a segurança da informação e a privacidade dos seus usuários, em rigorosa conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 — LGPD) e com o Marco Civil da Internet (Lei Federal nº 12.965/2014).",
      "Papel de Controlador: O Legion Altaire atua como Controlador no tratamento dos dados cadastrais, credenciais de acesso e dados de faturamento do Usuário assinante, utilizando essas informações exclusivamente para a execução do contrato de assinatura e cumprimento de obrigações fiscais.",
      "Papel de Operador: Em relação aos dados estratégicos de audiência, personas ou informações de mercado inseridas pelo Usuário na Base Estratégica dos Projetos Editoriais, o Legion Altaire atua como mero Operador técnico, processando os dados estritamente conforme as instruções e necessidades operacionais do próprio Usuário.",
    ],
    principles: [
      "Conformidade integral com os 10 princípios do Art. 6º da LGPD.",
      "Distinção clara entre os papéis de Controlador e Operador técnico.",
      "Transparência total na finalidade e no ciclo de vida de cada dado.",
    ],
  },
  {
    id: "dados-coletados",
    number: "02",
    title: "Categorias de Dados Coletados",
    content: [
      "Dados Cadastrais e de Identificação: Nome completo, endereço de e-mail corporativo, número de telefone para autenticação/suporte e eventuais informações de perfil profissional informadas no momento do cadastro.",
      "Dados de Pagamento e Faturamento: Razão social ou nome civil, CPF/CNPJ, endereço fiscal e histórico de faturas. Informações sensíveis de cartão de crédito não são armazenadas nos servidores do Legion Altaire; elas são processadas diretamente por gateway de pagamento homologado internacionalmente com certificação PCI-DSS.",
      "Dados Estratégicos de Operação: Informações de nicho, oferta, dores, desejos, objeções, tom de voz, temas aprovados e roteiros cadastrados dentro de cada Projeto Editorial. Esses dados pertencem ao Usuário e são tratados sob rigoroso isolamento lógico.",
      "Dados Técnicos de Conexão: Endereço IP, registros de data e hora de acesso, tipo de navegador e dados essenciais de telemetria estritamente necessários para prevenir ataques cibernéticos e fraudes.",
    ],
    principles: [
      "Tokenização bancária externa: zero armazenamento de números de cartão.",
      "Coleta orientada à necessidade mínima da operação (Princípio da Necessidade).",
      "Isolamento lógico de dados entre diferentes contas e Projetos Editoriais.",
    ],
  },
  {
    id: "finalidade-do-tratamento",
    number: "03",
    title: "Finalidades e Bases Legais do Tratamento",
    content: [
      "Prestação e Operação do Serviço (Art. 7º, V da LGPD): Viabilizar o funcionamento dos Projetos Editoriais, persistir o contexto da Base Estratégica, processar os modelos de inteligência artificial das 3 Funções e manter o histórico de roteiros e versões do assinante.",
      "Comunicação Operacional e Suporte (Art. 7º, V da LGPD): Responder a chamados técnicos abertos no canal de atendimento, emitir avisos sobre manutenções programadas e enviar notificações cruciais sobre a conta.",
      "Cumprimento de Obrigação Legal e Regulatória (Art. 7º, II da LGPD): Emissão de notas fiscais, guarda de registros de acesso a aplicações de internet pelo prazo legal de 6 (seis) meses (conforme o Art. 15 do Marco Civil da Internet) e atendimento a ordens judiciais formais.",
      "Segurança e Prevenção a Fraudes (Art. 7º, IX da LGPD): Monitoramento contra acessos indevidos, ataques de negação de serviço e proteção da infraestrutura tecnológica da plataforma.",
    ],
    principles: [
      "Tratamento respaldado em bases legais expressas na legislação.",
      "Proibição absoluta de venda ou comercialização de dados a terceiros.",
      "Guarda de registros em conformidade estrita com o Marco Civil da Internet.",
    ],
  },
  {
    id: "seguranca-e-armazenamento",
    number: "04",
    title: "Segurança da Informação e Armazenamento",
    content: [
      "O Legion Altaire adota medidas técnicas, administrativas e organizacionais de segurança de padrão internacional para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração ou qualquer forma de tratamento ilícito.",
      "Criptografia em Trânsito e em Repouso: Todas as comunicações entre o navegador do Usuário e a plataforma trafegam sob protocolo seguro TLS 1.3 (HTTPS) com certificados de 256 bits. Bases de dados e backups são armazenados com criptografia em repouso AES-256.",
      "Os dados são hospedados em centros de dados de primeira linha localizados em nuvem segura, submetidos a monitoramento contínuo de vulnerabilidades e com controle de acesso baseado no princípio do privilégio mínimo (least privilege).",
    ],
    principles: [
      "Tráfego criptografado com TLS 1.3 e repouso com AES-256.",
      "Monitoramento ativo de vulnerabilidades e proteção contra intrusão.",
      "Controle restrito de acessos administrativos com autenticação multifator.",
    ],
  },
  {
    id: "compartilhamento-de-dados",
    number: "05",
    title: "Hipóteses de Compartilhamento de Dados",
    content: [
      "O Legion Altaire não comercializa, não aluga e não compartilha dados pessoais ou estratégicos com corretores de dados, empresas de marketing ou redes de publicidade direcionada.",
      "O compartilhamento de dados ocorre unicamente com operadores de infraestrutura indispensáveis à execução do software, tais como: provedores de nuvem segura (hospedagem de servidores e banco de dados), processadores de pagamento homologados (cobrança bancária) e provedores de APIs de inteligência artificial de alto padrão para inferência dos modelos, mediante cláusulas de sigilo rigorosas.",
      "Em hipótese alguma os dados cadastrados na Base Estratégica do Usuário são utilizados para o treinamento público de modelos abertos de inteligência artificial por terceiros.",
    ],
    principles: [
      "Zero cessão para fins publicitários ou data brokers.",
      "Contratos de confidencialidade vinculantes com todos os operadores técnicos.",
      "Dados da Base Estratégica protegidos contra reaproveitamento por IA pública.",
    ],
  },
  {
    id: "direitos-dos-titulares",
    number: "06",
    title: "Direitos do Titular de Dados Pessoais",
    content: [
      "Em cumprimento ao Artigo 18 da LGPD, o Usuário, na qualidade de titular dos seus dados pessoais cadastrais, possui o direito de solicitar a qualquer momento:",
      "1. Confirmação da existência de tratamento e acesso aos seus dados pessoais armazenados.",
      "2. Correção de dados incompletos, inexatos ou desatualizados diretamente pelo painel ou via suporte.",
      "3. Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.",
      "4. Portabilidade dos dados para outro fornecedor de serviço, mediante requisição expressa.",
      "5. Revogação de consentimentos anteriormente concedidos e eliminação dos dados tratados sob essa base legal, ressalvadas as hipóteses de guarda obrigatória por lei.",
    ],
    principles: [
      "Canal simplificado para exercício de direitos garantidos pela LGPD.",
      "Atendimento a solicitações no prazo legal sem cobrança de taxas.",
      "Transparência sobre dados mantidos para cumprimento fiscal obrigatório.",
    ],
  },
  {
    id: "retencao-e-dpo",
    number: "07",
    title: "Retenção, Expurgo e Encarregado de Dados (DPO)",
    content: [
      "Os dados pessoais cadastrais e os Projetos Editoriais permanecem armazenados enquanto a conta do Usuário estiver ativa. Mediante cancelamento ou solicitação de exclusão, os dados são eliminados com segurança ou anonimizados em até 30 (trinta) dias, exceto quando a sua manutenção for expressamente exigida por obrigação legal (como registros fiscais e logs do Marco Civil da Internet).",
      "Para exercer qualquer um dos seus direitos de titular, formalizar requisições da LGPD ou sanar dúvidas sobre como seus dados são tratados, entre em contato diretamente com nosso Encarregado pelo Tratamento de Dados Pessoais (DPO):",
      "E-mail do Encarregado: privacidade@legionaltaire.com.br | Respostas em até 5 dias úteis.",
    ],
    principles: [
      "Expurgo seguro de contas inativas conforme procedimento padrão.",
      "Canal direto e formal com o Encarregado de Proteção de Dados (DPO).",
      "Compromisso permanente com a segurança e a privacidade do usuário.",
    ],
  },
] as const;

export default function PoliticaDePrivacidadePage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    PRIVACY_SECTIONS[0].id
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of PRIVACY_SECTIONS) {
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
        id="privacidade-topo"
        ariaLabelledBy="privacidade-hero-title"
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
            label="SEGURANÇA DA INFORMAÇÃO E LGPD"
            variant="pill"
          />

          <h1
            id="privacidade-hero-title"
            className="mt-2 text-balance font-la-sans text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.028em] text-la-text-primary"
          >
            Política de Privacidade
          </h1>

          <div className="flex flex-wrap items-center gap-3 font-la-mono text-[0.75rem] text-la-text-secondary">
            <span>Última atualização: Outubro de 2026</span>
            <span aria-hidden="true">•</span>
            <span className="text-la-gold-light">LGPD (Lei 13.709/2018)</span>
            <span aria-hidden="true">•</span>
            <span>Criptografia TLS 1.3 / AES-256</span>
          </div>

          <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
            Esta Política descreve como o Legion Altaire coleta, armazena,
            processa e protege os dados pessoais e as informações corporativas
            de seus usuários, garantindo confidencialidade, integridade e
            atendimento integral aos direitos dos titulares.
          </p>

          <div className="mt-2 flex items-center gap-2.5 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-4 py-2.5">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-la-gold" />
            <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
              Seus dados estratégicos não são usados para treinar modelos abertos de inteligência artificial.
            </span>
          </div>
        </div>
      </SectionShell>

      {/* 2. CORPO DO DOCUMENTO: SUMÁRIO RÁPIDO LATERAL + PROSE ESTRUTURADO */}
      <SectionShell
        id="privacidade-corpo"
        ariaLabel="Conteúdo da Política de Privacidade"
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
                  Sumário de Privacidade
                </span>
              </div>

              <nav
                aria-label="Sumário da política de privacidade"
                className="flex flex-col gap-1.5"
              >
                {PRIVACY_SECTIONS.map((sec) => {
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
                <div className="flex flex-col gap-1 rounded-la-md border border-white/10 bg-black/40 p-3 font-la-mono text-[0.6875rem]">
                  <span className="text-la-text-muted">Canal do DPO:</span>
                  <span className="truncate font-semibold text-la-gold-light">
                    privacidade@legionaltaire.com.br
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* SEÇÕES DETALHADAS (PROSE ESTRUTURADO JUSTIFICADO) */}
          <div className="flex flex-col gap-12 lg:col-span-8">
            {PRIVACY_SECTIONS.map((section) => (
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

                {section.principles && section.principles.length > 0 ? (
                  <div className="mt-6 rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Garantias de Privacidade e Segurança
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-2">
                      {section.principles.map((principle) => (
                        <li
                          key={principle}
                          className="flex items-start gap-2.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-la-gold"
                          />
                          <span>{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ))}

            {/* BOX FINAL DE CONTATO COM O ENCARREGADO (DPO) */}
            <div className="rounded-la-xl border border-la-border-gold/45 bg-[#07090F]/95 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-[34rem] flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-la-gold" />
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Encarregado pelo Tratamento de Dados (DPO)
                    </span>
                  </div>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    Para exercer os direitos garantidos pelo Art. 18 da LGPD ou
                    solicitar o relatório formal de seus dados tratados na
                    plataforma, acione nosso canal dedicado de privacidade.
                  </p>
                </div>

                <a
                  href="mailto:privacidade@legionaltaire.com.br"
                  className="inline-flex min-h-[2.625rem] shrink-0 items-center justify-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contatar DPO</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}