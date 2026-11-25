"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { Loader2, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { AppDispatch } from "@/lib/redux/store";
import {
  addBrand,
  setSelectedBrandId,
  updateBrandInList,
} from "@/lib/redux/slices/companySlice";
import {
  apiCreateCompanyBrand,
  apiUpdateBrand,
} from "@/lib/services/brandService";
import { IBrand } from "@/types/company";

interface BrandFormModalProps {
  mode: "create" | "edit";
  companyId: string;
  brand?: IBrand | null;
  open: boolean;
  onClose: () => void;
  onSaved?: (brand: IBrand) => void;
}

export function BrandFormModal({
  mode,
  companyId,
  brand,
  open,
  onClose,
  onSaved,
}: BrandFormModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    if (mode === "edit" && brand) {
      setName(brand.name || "");
      setNiche(brand.niche || "");
      setDescription(brand.description || "");
    } else {
      setName("");
      setNiche("");
      setDescription("");
    }
  }, [open, mode, brand]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setErrorMsg("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "edit" && brand) {
        const updated = await apiUpdateBrand(brand._id, {
          name: name.trim(),
          niche: niche.trim() || undefined,
          description: description.trim() || undefined,
        });
        dispatch(updateBrandInList(updated));
        toast.success(`Marca "${updated.name}" atualizada com sucesso.`);
        onSaved?.(updated);
      } else {
        const created = await apiCreateCompanyBrand(companyId, {
          name: name.trim(),
          niche: niche.trim() || undefined,
          description: description.trim() || undefined,
        });
        dispatch(addBrand(created));
        dispatch(setSelectedBrandId(created._id));
        toast.success(`Marca "${created.name}" criada com sucesso.`);
        onSaved?.(created);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível salvar a marca.";
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
        aria-labelledby="brand-modal-title"
        className="w-full max-w-md rounded-md border border-border bg-card p-6 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h2 id="brand-modal-title" className="text-base font-semibold">
              {mode === "edit" ? "Editar Marca" : "Nova Marca da Empresa"}
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
              Nome da Marca *
            </label>
            <input
              type="text"
              required
              minLength={2}
              placeholder="Ex.: Altaire Academy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nicho Principal (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex.: Educação Corporativa"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Descrição / Posicionamento (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Resumo do posicionamento desta marca..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
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
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>
                {mode === "edit" ? "Salvar Marca" : "Criar Marca"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
