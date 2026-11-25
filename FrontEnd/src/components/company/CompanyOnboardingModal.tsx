"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { ArrowRight, Building2, CheckCircle2, Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { AppDispatch } from "@/lib/redux/store";
import {
  addBrand,
  addCompany,
  setSelectedBrandId,
} from "@/lib/redux/slices/companySlice";
import { apiCreateCompany } from "@/lib/services/companyService";
import { apiCreateCompanyBrand } from "@/lib/services/brandService";
import { formatCnpjInput } from "@/lib/utils";
import { ICompanyWithAccess } from "@/types/company";

function suggestAcronym(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

interface CreateCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (company: ICompanyWithAccess) => void;
}

export function CreateCompanyModal({
  open,
  onClose,
  onCreated,
}: CreateCompanyModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [acronymTouched, setAcronymTouched] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setAcronym("");
    setAcronymTouched(false);
    setCnpj("");
    setErrorMsg(null);
  }, [open]);

  if (!open) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!acronymTouched) {
      setAcronym(suggestAcronym(val));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2 || acronym.trim().length < 2) {
      setErrorMsg("Informe o nome e uma sigla de 2 a 4 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await apiCreateCompany({
        name: name.trim(),
        acronym: acronym.trim().toUpperCase(),
        cnpj: cnpj.trim() || undefined,
      });
      const enriched: ICompanyWithAccess = {
        ...created,
        isCompanyManager: true,
        membership: null,
      };
      dispatch(addCompany(enriched));
      toast.success(`Empresa "${created.name}" criada com sucesso.`);
      onCreated?.(enriched);
      onClose();
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Erro ao criar empresa.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-company-title"
        className="w-full max-w-md rounded-md border border-border bg-card p-6 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 id="create-company-title" className="text-base font-semibold">
              Nova Empresa na Altaire
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              placeholder="Ex.: Grupo Vanguarda"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Sigla (2–4 letras) *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={4}
                placeholder="VNG"
                value={acronym}
                onChange={(e) => {
                  setAcronymTouched(true);
                  setAcronym(e.target.value.toUpperCase());
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm uppercase text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <p className="text-[0.6875rem] text-muted-foreground">
                Aceita números ou formato 00.000.000/0001-00.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              <span>Criar Empresa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CompanyOnboardingModalProps {
  open: boolean;
}

export function CompanyOnboardingModal({ open }: CompanyOnboardingModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState<1 | 2>(1);
  const [createdCompany, setCreatedCompany] =
    useState<ICompanyWithAccess | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [acronymTouched, setAcronymTouched] = useState(false);
  const [cnpj, setCnpj] = useState("");

  const [brandName, setBrandName] = useState("");
  const [brandNiche, setBrandNiche] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if ((!open && step === 1) || dismissed) return null;

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
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Erro ao criar empresa.";
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
      setDismissed(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar marca.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-company-title"
        className="w-full max-w-lg rounded-md border border-primary/40 bg-card p-6 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-primary">
              {step === 1 ? (
                <>
                  <Building2 className="h-3.5 w-3.5" /> Passo 1 de 2 · Empresa
                </>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5" /> Passo 2 de 2 · Marca
                </>
              )}
            </span>
            <h2 id="onboarding-company-title" className="text-lg font-bold">
              {step === 1
                ? "Configure sua 1ª Empresa na Altaire"
                : `Crie a 1ª Marca de ${createdCompany?.name}`}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
          <form onSubmit={handleCreateFirstCompany} className="mt-4 space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Dentro da organização Altaire, cada empresa mantém suas marcas,
              projetos editoriais, equipe e arquivos completamente isolados.
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Sigla *
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm uppercase text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <p className="text-[0.6875rem] text-muted-foreground">
                  Aceita números ou formato 00.000.000/0001-00.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                <span>Criar Empresa e Continuar</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateFirstBrand} className="mt-4 space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Marcas agrupam seus projetos editoriais e compartilham o BrandStory
              dentro da empresa.
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                onClick={() => setDismissed(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Pular por agora
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>Concluir Configuração</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
