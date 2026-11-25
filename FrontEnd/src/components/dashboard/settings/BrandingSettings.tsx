"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Building2, CheckCircle, Loader2, UploadCloud } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch } from "@/lib/redux/store";
import {
  selectCurrentCompany,
  updateCurrentCompanySettings,
} from "@/lib/redux/slices/companySlice";
import { apiUpdateCompanySettings } from "@/lib/services/companyService";
import { uploadFileToR2 } from "@/lib/services/storageService";

export function BrandingSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const currentCompany = useSelector(selectCurrentCompany);

  const companyId = currentCompany?._id;
  const canManage = Boolean(currentCompany?.isCompanyManager);

  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [images, setImages] = useState({
    logoUrl: currentCompany?.settings?.logoUrl || "",
    headerUrl: currentCompany?.settings?.headerUrl || "",
    footerUrl: currentCompany?.settings?.footerUrl || "",
  });

  useEffect(() => {
    setImages({
      logoUrl: currentCompany?.settings?.logoUrl || "",
      headerUrl: currentCompany?.settings?.headerUrl || "",
      footerUrl: currentCompany?.settings?.footerUrl || "",
    });
    setSuccessMsg("");
  }, [
    currentCompany?._id,
    currentCompany?.settings?.logoUrl,
    currentCompany?.settings?.headerUrl,
    currentCompany?.settings?.footerUrl,
  ]);

  if (!currentCompany) {
    return (
      <div className="w-full max-w-4xl rounded-md border border-border bg-card p-8 text-center text-foreground">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h3 className="font-bold">Nenhuma empresa selecionada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione uma empresa para personalizar sua identidade visual.
        </p>
      </div>
    );
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: "logoUrl" | "headerUrl" | "footerUrl"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !companyId || !canManage) return;

    try {
      setIsLoading((prev) => ({ ...prev, [fieldName]: true }));
      setSuccessMsg("");

      const fileUrl = await uploadFileToR2(file);
      const updatedSettings = {
        ...images,
        [fieldName]: fileUrl,
      };

      await apiUpdateCompanySettings(companyId, updatedSettings);

      setImages(updatedSettings);
      dispatch(updateCurrentCompanySettings(updatedSettings));
      setSuccessMsg("Imagem atualizada com sucesso na empresa!");
      toast.success("Identidade visual atualizada!");
    } catch (error: any) {
      toast.error(error?.message || "Falha ao fazer upload da imagem.");
    } finally {
      setIsLoading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const renderUploadBox = (
    title: string,
    description: string,
    fieldName: "logoUrl" | "headerUrl" | "footerUrl",
    aspectRatio: string
  ) => {
    const currentImage = images[fieldName];
    const loading = isLoading[fieldName];

    return (
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div
          className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 ${aspectRatio}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                Enviando...
              </span>
            </div>
          ) : currentImage ? (
            <>
              <Image
                src={currentImage}
                alt={title}
                fill
                className="object-contain p-2"
                unoptimized
              />
              {canManage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100">
                  <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md">
                    Trocar Imagem
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, fieldName)}
                    />
                  </label>
                </div>
              ) : null}
            </>
          ) : canManage ? (
            <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-4 text-center">
              <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-semibold text-primary">
                Clique para anexar
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG ou JPG (Máx. 2MB)
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => handleFileUpload(e, fieldName)}
              />
            </label>
          ) : (
            <span className="text-xs text-muted-foreground">
              Nenhuma imagem configurada.
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Identidade Visual — {currentCompany.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize a logomarca e o papel timbrado desta empresa.
        </p>
      </div>

      {successMsg ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400">
          <CheckCircle className="h-4 w-4" /> {successMsg}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {renderUploadBox(
          "Logomarca Oficial",
          "Utilizada nos documentos e materiais quando o papel timbrado não for configurado.",
          "logoUrl",
          "aspect-video max-h-48"
        )}
        {renderUploadBox(
          "Cabeçalho do Relatório (Header)",
          "Imagem panorâmica que ocupará o topo da folha A4. Recomendado: 2480 x 350 pixels.",
          "headerUrl",
          "aspect-[6/1] max-h-32"
        )}

        <div className="md:col-span-2">
          {renderUploadBox(
            "Rodapé do Relatório (Footer)",
            "Imagem panorâmica que ocupará a base da folha A4. Recomendado: 2480 x 250 pixels.",
            "footerUrl",
            "aspect-[8/1] max-h-24"
          )}
        </div>
      </div>
    </div>
  );
}
