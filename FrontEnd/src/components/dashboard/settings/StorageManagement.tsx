"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  ExternalLink,
  File,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import {
  selectCompanyBrands,
  selectCurrentCompany,
} from "@/lib/redux/slices/companySlice";
import { RootState } from "@/lib/redux/store";
import { storageService, uploadFileToR2 } from "@/lib/services/storageService";

const LIMITS = {
  FREE: 500 * 1024 * 1024,
  PRO: 50 * 1024 * 1024 * 1024,
  ENTERPRISE: 500 * 1024 * 1024 * 1024,
};

interface FileAsset {
  _id: string;
  companyId: string;
  brandId?: string | null;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

type SortKey = "fileName" | "mimeType" | "sizeBytes" | "createdAt";
type SortDirection = "asc" | "desc";

export function StorageManagement() {
  const currentCompany = useSelector(selectCurrentCompany);
  const brands = useSelector(selectCompanyBrands);
  const token = useSelector((state: RootState) => state.auth.token);
  const loggedUser = useSelector((state: RootState) => state.auth.user);
  const loggedUserId = loggedUser?.sub || (loggedUser as any)?._id;

  const companyId = currentCompany?._id;
  const companyPlan = (currentCompany?.plan || "FREE") as keyof typeof LIMITS;
  const canManageCompany = Boolean(currentCompany?.isCompanyManager);

  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("");
  const [assets, setAssets] = useState<FileAsset[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [assetPendingDelete, setAssetPendingDelete] = useState<FileAsset | null>(
    null
  );

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "createdAt",
    direction: "desc",
  });

  const storageLimit = LIMITS[companyPlan] || LIMITS.FREE;

  const brandNameMap = useMemo(
    () => new Map(brands.map((b) => [b._id, b.name])),
    [brands]
  );

  const fetchStorageData = useCallback(async () => {
    if (!companyId || !token) {
      setAssets([]);
      setStorageUsed(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await storageService.getAssets(
        selectedBrandFilter || undefined
      );
      setAssets(Array.isArray(data?.assets) ? data.assets : []);
      setStorageUsed(Number(data?.storageUsed || 0));
    } catch (error: any) {
      toast.error(error?.message || "Erro ao buscar arquivos da empresa.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, token, selectedBrandFilter]);

  useEffect(() => {
    setSelectedBrandFilter("");
  }, [companyId]);

  useEffect(() => {
    void fetchStorageData();
  }, [fetchStorageData]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !companyId) return;

    try {
      setIsUploading(true);
      await uploadFileToR2(file, selectedBrandFilter || undefined);
      toast.success(`Arquivo "${file.name}" enviado com sucesso.`);
      await fetchStorageData();
    } catch (error: any) {
      toast.error(error?.message || "Falha ao enviar o arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedAssets = useMemo(() => {
    const sortableItems = [...assets];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [assets, sortConfig]);

  const handleRequestDelete = (asset: FileAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!companyId || !token) return;

    if (
      !canManageCompany &&
      String(asset.uploadedBy) !== String(loggedUserId)
    ) {
      toast.error("Você só pode excluir arquivos enviados por você.");
      return;
    }

    setAssetPendingDelete(asset);
  };

  const handleConfirmDelete = async () => {
    if (!companyId || !token || !assetPendingDelete) return;
    const asset = assetPendingDelete;

    try {
      setIsDeleting(asset._id);
      await storageService.deleteAsset(asset._id);

      setAssets((prev) => prev.filter((item) => item._id !== asset._id));
      setStorageUsed((prev) => Math.max(0, prev - asset.sizeBytes));
      setAssetPendingDelete(null);
      toast.success("Arquivo removido com sucesso.");
    } catch (error: any) {
      toast.error(error?.message || "Falha ao excluir o arquivo.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("image"))
      return <ImageIcon className="h-5 w-5 text-primary" />;
    if (mimeType.includes("pdf"))
      return <FileText className="h-5 w-5 text-destructive" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  if (!currentCompany) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center text-foreground">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h3 className="font-bold">Nenhuma empresa selecionada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione uma empresa na barra lateral para gerenciar seus arquivos.
        </p>
      </div>
    );
  }

  const usagePercentage = Math.min(100, (storageUsed / storageLimit) * 100);
  const isNearLimit = usagePercentage > 85;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-border bg-card p-10">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Calculando espaço em disco de {currentCompany.name}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-md p-2 ${
                isNearLimit
                  ? "bg-destructive/15 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                Armazenamento — {currentCompany.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Consumo do plano{" "}
                <span className="font-bold uppercase">{companyPlan}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black tracking-tight">
                {formatBytes(storageUsed, 0)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                / {formatBytes(storageLimit, 0)}
              </span>
            </div>

            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90">
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>{isUploading ? "Enviando..." : "Enviar Arquivo"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={handleUploadFile}
              />
            </label>
          </div>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              isNearLimit ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        {isNearLimit ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Você está se aproximando do limite de armazenamento desta empresa.
          </div>
        ) : null}

        {brands.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground">
              Escopo:
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrandFilter("")}
              className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                selectedBrandFilter === ""
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos da empresa
            </button>
            {brands.map((brand) => (
              <button
                key={brand._id}
                type="button"
                onClick={() => setSelectedBrandFilter(brand._id)}
                className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                  selectedBrandFilter === brand._id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th
                  onClick={() => handleSort("fileName")}
                  className="group cursor-pointer px-4 py-3 font-semibold transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Arquivo{" "}
                    <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </th>
                <th className="w-36 px-4 py-3 font-semibold">Marca</th>
                <th
                  onClick={() => handleSort("mimeType")}
                  className="group w-24 cursor-pointer px-4 py-3 font-semibold transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Tipo{" "}
                    <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sizeBytes")}
                  className="group w-28 cursor-pointer px-4 py-3 font-semibold transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Tamanho{" "}
                    <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="group w-36 cursor-pointer px-4 py-3 font-semibold transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Enviado em{" "}
                    <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </th>
                <th className="w-20 px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-medium text-muted-foreground"
                  >
                    Nenhum arquivo armazenado para este filtro.
                  </td>
                </tr>
              ) : (
                sortedAssets.map((asset) => {
                  const canDelete =
                    canManageCompany ||
                    String(asset.uploadedBy) === String(loggedUserId);
                  const brandLabel = asset.brandId
                    ? brandNameMap.get(asset.brandId) || "Marca"
                    : "Geral da Empresa";

                  return (
                    <tr
                      key={asset._id}
                      onClick={() => window.open(asset.fileUrl, "_blank")}
                      className="group cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="flex items-center gap-3 px-4 py-3 font-medium text-foreground">
                        {getFileIcon(asset.mimeType)}
                        <span
                          className="max-w-[200px] truncate md:max-w-xs"
                          title={asset.fileName}
                        >
                          {asset.fileName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {brandLabel}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                        {asset.mimeType.split("/")[1] || "FILE"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 text-muted-foreground transition-colors hover:text-primary"
                            title="Abrir arquivo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={(e) => handleRequestDelete(asset, e)}
                              disabled={isDeleting === asset._id}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              title="Excluir arquivo permanentemente"
                            >
                              {isDeleting === asset._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(assetPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setAssetPendingDelete(null);
        }}
        title={`Excluir "${assetPendingDelete?.fileName || ""}"?`}
        description="O arquivo será removido definitivamente do armazenamento em nuvem e não poderá ser recuperado."
        confirmLabel="Excluir Arquivo"
        isLoading={Boolean(isDeleting)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
