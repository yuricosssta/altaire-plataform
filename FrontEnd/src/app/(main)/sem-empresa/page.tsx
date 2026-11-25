"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import LogoBloco from "@/components/LogoBloco";
import { ROUTES } from "@/lib/constants/routes";
import { logout } from "@/lib/redux/slices/authSlice";
import {
  addBrand,
  addCompany,
  clearCompanyState,
  fetchMyCompanies,
  selectAllCompanies,
  selectCompanyStatus,
  setSelectedBrandId,
} from "@/lib/redux/slices/companySlice";
import { selectCurrentOrg } from "@/lib/redux/slices/organizationSlice";
import { fetchUserProfile } from "@/lib/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { apiCreateCompanyBrand } from "@/lib/services/brandService";
import { apiCreateCompany } from "@/lib/services/companyService";
import { formatCnpjInput } from "@/lib/utils";
import type { ICompanyWithAccess } from "@/types/company";

function suggestAcronym(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export default function SemEmpresaPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((state: RootState) => state.auth?.user);
  const userProfile = useSelector((state: RootState) => state.user?.profile);
  const userStatus = useSelector((state: RootState) => state.user?.status);
  const currentOrg = useSelector(selectCurrentOrg);
  const companies = useSelector(selectAllCompanies);
  const companyStatus = useSelector(selectCompanyStatus);

  const [step, setStep] = useState<1 | 2>(1);
  const [createdCompany, setCreatedCompany] =
    useState<ICompanyWithAccess | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [acronymTouched, setAcronymTouched] = useState(false);
  const [cnpj, setCnpj] = useState("");

  const [brandName, setBrandName] = useState("");
  const [brandNiche, setBrandNiche] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const normalizedRole = String(
    userProfile?.role || currentOrg?.role || authUser?.role || "member"
  ).toLowerCase();
  const isClientRole = normalizedRole === "client";
  const isExternalRole = normalizedRole === "external";
  const isRestrictedRole = isClientRole || isExternalRole;
  const isAltaireAdmin =
    normalizedRole === "owner" ||
    normalizedRole === "admin" ||
    Boolean(userProfile?.isAdmin);

  const userPlan = String(userProfile?.plan || "FREE").toUpperCase();
  const isProPlan = userPlan === "PRO" || userPlan === "ENTERPRISE";
  const canCreateCompany = !isRestrictedRole && (isAltaireAdmin || isProPlan);

  const userEmail = String(userProfile?.email || authUser?.email || "");
  const userName = String(
    userProfile?.name || authUser?.name || authUser?.fullName || ""
  );

  const getDestinationByRole = () => {
    if (isClientRole) return ROUTES.portalCliente;
    if (isExternalRole) return ROUTES.portalExterno;
    return ROUTES.centralEstrategica;
  };

  useEffect(() => {
    if (
      companyStatus === "succeeded" &&
      companies.length > 0 &&
      step === 1 &&
      !createdCompany
    ) {
      router.replace(getDestinationByRole());
    }
  }, [companyStatus, companies.length, step, createdCompany, router]);

  const handleRefreshAccess = async () => {
    try {
      setIsRefreshing(true);
      const [profileResult, companiesResult] = await Promise.all([
        dispatch(fetchUserProfile()).unwrap().catch(() => null),
        dispatch(fetchMyCompanies()).unwrap().catch(() => []),
      ]);

      const foundCompanies = Array.isArray(companiesResult) ? companiesResult : [];
      if (foundCompanies.length > 0) {
        toast.success("Empresa vinculada encontrada! Redirecionando...");
        router.replace(getDestinationByRole());
        return;
      }

      const refreshedPlan = String(profileResult?.plan || "FREE").toUpperCase();
      if (refreshedPlan === "PRO" || refreshedPlan === "ENTERPRISE") {
        toast.success("Plano PRO identificado! Você já pode criar sua empresa.");
        return;
      }

      toast.info("Nenhum vínculo ou plano PRO ativo encontrado ainda.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    try {
      window.localStorage.removeItem("la-session-active");
      window.localStorage.removeItem("token");
      document.cookie = "active_company_id=; path=/; max-age=0";
    } catch {
      /* Ignora bloqueio de storage */
    }
    dispatch(clearCompanyState());
    dispatch(logout());
    router.replace(ROUTES.login);
  };

  const handleCreateFirstCompany = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (companyName.trim().length < 2 || acronym.trim().length < 2) {
      setErrorMsg("Informe o nome da empresa e uma sigla de 2 a 4 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await apiCreateCompany({
        name: companyName.trim(),
        acronym: acronym.trim().toUpperCase(),
        cnpj: cnpj.trim() || undefined,
      });
      const enriched: ICompanyWithAccess = {
        ...created,
        isCompanyManager: true,
        membership: null,
      };
      setCreatedCompany(enriched);
      dispatch(addCompany(enriched));
      toast.success("1ª Empresa criada! Agora cadastre sua 1ª Marca.");
      setStep(2);
    } catch (err: unknown) {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Erro ao criar empresa.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFirstBrand = async (e: FormEvent) => {
    e.preventDefault();
    if (!createdCompany) return;
    setErrorMsg(null);

    if (brandName.trim().length < 2) {
      setErrorMsg("Informe o nome da marca com pelo menos 2 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const createdBrand = await apiCreateCompanyBrand(createdCompany._id, {
        name: brandName.trim(),
        niche: brandNiche.trim() || undefined,
        description: brandDescription.trim() || undefined,
      });
      dispatch(addBrand(createdBrand));
      dispatch(setSelectedBrandId(createdBrand._id));
      toast.success(`Marca "${createdBrand.name}" pronta para receber projetos!`);
      router.replace(ROUTES.centralEstrategica);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao criar marca.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBootstrapping =
    companyStatus === "idle" ||
    companyStatus === "loading" ||
    userStatus === "idle" ||
    userStatus === "loading";

  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen w-full flex-col bg-background text-foreground antialiased"
    >
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <LogoBloco
            orientation="horizontal"
            size="sm"
            tone="public-dark"
            href={ROUTES.home}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {userEmail ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs">
                <span className="truncate max-w-[14rem] text-muted-foreground">
                  {userEmail}
                </span>
                <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-semibold uppercase text-primary">
                  {isAltaireAdmin ? normalizedRole.toUpperCase() : userPlan}
                </span>
              </div>
            ) : null}

            {isAltaireAdmin ? (
              <Link
                href="/dashboard/master-admin"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Master Admin</span>
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        {isBootstrapping ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-border bg-card p-8 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Verificando empresas e permissões da sua conta...
            </p>
          </div>
        ) : canCreateCompany ? (
          <div className="mx-auto w-full max-w-xl space-y-6">
            <div className="rounded-md border border-primary/40 bg-card p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-primary">
                    {step === 1 ? (
                      <>
                        <Building2 className="h-3.5 w-3.5" /> Passo 1 de 2 ·
                        Empresa
                      </>
                    ) : (
                      <>
                        <Tag className="h-3.5 w-3.5" /> Passo 2 de 2 · Marca
                      </>
                    )}
                  </span>
                  <h1 className="font-heading text-2xl font-bold text-foreground">
                    {step === 1
                      ? "Configure sua 1ª Empresa na Altaire"
                      : `Crie a 1ª Marca de ${createdCompany?.name}`}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-6 rounded-full ${
                      step === 1 ? "bg-primary" : "bg-primary/40"
                    }`}
                  />
                  <span
                    className={`h-2 w-6 rounded-full ${
                      step === 2 ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              </div>

              {step === 1 ? (
                <form
                  onSubmit={handleCreateFirstCompany}
                  className="mt-5 space-y-4"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Olá{userName ? `, ${userName.split(" ")[0]}` : ""}. Sua conta
                    possui acesso habilitado para criar empresas. Cada empresa
                    mantém suas marcas, projetos editoriais, equipe e arquivos
                    completamente isolados.
                  </p>

                  {errorMsg ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {errorMsg}
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      placeholder="Ex.: Agência Altaire Studio"
                      value={companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompanyName(val);
                        if (!acronymTouched) setAcronym(suggestAcronym(val));
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Sigla (2–4 letras) *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={4}
                        placeholder="AAS"
                        value={acronym}
                        onChange={(e) => {
                          setAcronymTouched(true);
                          setAcronym(e.target.value.toUpperCase());
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        CNPJ (Opcional)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="00.000.000/0001-00"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCnpjInput(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      <span>Criar Empresa e Continuar</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={handleCreateFirstBrand}
                  className="mt-5 space-y-4"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Marcas agrupam seus projetos editoriais e compartilham o
                    BrandStory dentro da empresa.
                  </p>

                  {errorMsg ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {errorMsg}
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nome da Marca *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      placeholder="Ex.: Marca Principal"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nicho Principal (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Saúde e Estética"
                      value={brandNiche}
                      onChange={(e) => setBrandNiche(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Breve descrição da marca..."
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => router.replace(ROUTES.centralEstrategica)}
                      className="min-h-[2.75rem] px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Pular por agora
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Concluir Configuração</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {step === 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-5 py-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Foi convidado para uma empresa existente?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifique novamente após o gestor vincular o e-mail{" "}
                    <strong className="text-foreground">{userEmail}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshAccess}
                  disabled={isRefreshing}
                  className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  <span>Verificar novamente</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Card 1: Aguardando vinculação */}
            <section className="flex flex-col justify-between rounded-md border border-border bg-card p-6 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block rounded-md border border-border bg-background px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status da Conta · Sem Vínculo
                  </span>
                  <h1 className="font-heading text-2xl font-bold text-foreground">
                    Aguardando vinculação a uma empresa
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Seu cadastro foi concluído, mas você ainda não está associado
                    a nenhuma empresa na plataforma Altaire. Solicite ao gestor
                    responsável (usuário PRO) que vincule seu e-mail à empresa
                    correspondente.
                  </p>
                </div>

                {userEmail ? (
                  <div className="rounded-md border border-border bg-background px-4 py-3">
                    <span className="block text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                      E-mail para vinculação
                    </span>
                    <span className="mt-0.5 block font-mono text-sm font-semibold text-foreground">
                      {userEmail}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={handleRefreshAccess}
                  disabled={isRefreshing}
                  className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span>Verificar novamente</span>
                </button>
              </div>
            </section>

            {/* Card 2: Convite para assinatura PRO */}
            <section className="flex flex-col justify-between rounded-md border border-primary/45 bg-card p-6 shadow-xl sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-primary bg-primary/15">
                  <Crown className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3 w-3" /> Altaire PRO
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    Quer criar sua própria empresa e gerenciar equipes?
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    A criação de empresas, marcas e o cadastro prévio de membros
                    estão disponíveis para assinantes PRO. Assine a plataforma
                    para estruturar sua operação imediatamente.
                  </p>
                </div>

                <ul className="space-y-2.5 border-t border-border pt-4 text-sm text-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Crie empresas e marcas com isolamento completo de projetos
                      e arquivos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Pré-cadastre colaboradores, clientes e editores externos
                      nas suas empresas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Libere todos os fluxos de Linha Editorial, Calendário,
                      Temas e Roteiros.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <Link
                  href={ROUTES.precos}
                  className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <span>Conhecer planos e assinar</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={ROUTES.contato}
                  className="inline-flex min-h-[2.75rem] items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Falar com a equipe
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
