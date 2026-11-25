//src/components/dashboard/settings/DataManagement.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Download, Upload, FileSpreadsheet, CheckCircle2,
  Trash2, AlertTriangle, Save, Loader2, X
} from "lucide-react";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import {
  selectCompanyBrands,
  selectSelectedBrandId,
} from "@/lib/redux/slices/companySlice";
import { editorialService } from "@/lib/services/editorialService";
import { scriptsService } from "@/lib/services/scriptsService";

interface ImportRow {
  id: string;
  name: string;
  niche: string;
  subniche: string;
  currentObjective: "branding" | "conversao" | "autoridade";
  isVerified: boolean;
}

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brands = useSelector(selectCompanyBrands);
  const selectedBrandId = useSelector(selectSelectedBrandId);
  const targetBrandId = selectedBrandId || brands[0]?._id || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draftRows, setDraftRows] = useState<ImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => setMounted(true), []);

  const downloadTemplate = () => {
    const headers = "Projeto;Nicho;Subnicho;Objetivo (branding, conversao, autoridade)\n";
    const example = "Meu Novo Projeto;Posicionamento Digital;Consultoria B2B;autoridade\n";

    const blob = new Blob(["\ufeff" + headers + example], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "altaire_modelo_projetos_editoriais.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const [projects, publications] = await Promise.all([
        editorialService.listProjects().catch(() => []),
        scriptsService.listPublications().catch(() => []),
      ]);

      const lines: string[] = [
        "Tipo;Projeto;Nicho_ou_Formato;Subnicho_ou_Titulo;Status",
      ];

      for (const proj of projects) {
        lines.push(
          [
            "Projeto Editorial",
            proj.name,
            proj.niche,
            proj.subniche,
            proj.status || "active",
          ]
            .map((v) => String(v || "").replace(/;/g, ","))
            .join(";")
        );
      }

      for (const pub of publications) {
        lines.push(
          [
            "Roteiro/Ativo",
            pub.projectName || String(pub.projectId || ""),
            pub.format || pub.formatSlug || "",
            pub.title || "",
            pub.status || "rascunho",
          ]
            .map((v) => String(v || "").replace(/;/g, ","))
            .join(";")
        );
      }

      const blob = new Blob(["\ufeff" + lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "altaire_exportacao_editorial.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      delimiter: ";",
      skipEmptyLines: true,
      complete: (results) => {
        const lines = results.data as string[][];

        const parsedRows: ImportRow[] = lines.slice(1).map((cols, index) => {
          const objRaw = String(cols[3] || "").trim().toLowerCase();
          const currentObjective: ImportRow["currentObjective"] =
            objRaw === "branding"
              ? "branding"
              : objRaw === "conversao" || objRaw === "conversão"
                ? "conversao"
                : "autoridade";

          return {
            id: `row_${Date.now()}_${index}`,
            name: cols[0]?.trim() || "",
            niche: cols[1]?.trim() || "Geral",
            subniche: cols[2]?.trim() || "Conteúdo",
            currentObjective,
            isVerified: false,
          };
        });

        const validRows = parsedRows.filter((r) => r.name !== "");
        setDraftRows(validRows);
        setIsImporting(validRows.length > 0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const updateRow = (index: number, field: keyof ImportRow, value: string) => {
    setDraftRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const toggleVerify = (index: number) => {
    setDraftRows((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, isVerified: !row.isVerified } : row
      )
    );
  };

  const cancelImport = () => {
    setDraftRows([]);
    setIsImporting(false);
  };

  const handleFinalSubmit = async () => {
    const unverifiedCount = draftRows.filter((r) => !r.isVerified).length;
    if (unverifiedCount > 0) {
      alert(`Faltam ${unverifiedCount} linha(s) para conferência.`);
      return;
    }

    if (!targetBrandId) {
      alert("Cadastre ou selecione uma marca na empresa ativa antes de importar projetos.");
      return;
    }

    try {
      setIsSubmitting(true);
      for (const row of draftRows) {
        await editorialService.createProject({
          name: row.name,
          brandId: targetBrandId,
          niche: row.niche,
          subniche: row.subniche,
          currentObjective: row.currentObjective,
        });
      }

      alert("Projetos editoriais importados com sucesso!");
      setDraftRows([]);
      setIsImporting(false);
      setIsModalOpen(false);
    } catch {
      alert("Erro ao salvar projetos importados no servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allVerified = draftRows.length > 0 && draftRows.every((r) => r.isVerified);

  return (
    <>
      <section className="flex flex-col sm:flex-row sm:items-center justify-between border border-border bg-card rounded-sm p-5 shadow-sm gap-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            Base de Dados Editorial
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Importe novos Projetos Editoriais via CSV ou exporte seus projetos e roteiros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportCsv}
            className="h-9 px-4 py-2 bg-background border border-border rounded-sm text-sm font-medium hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Importar
          </button>
        </div>
      </section>

      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-6xl max-h-[90vh] rounded-sm shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Importação de Projetos Editoriais (CSV)
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/10">
              {!isImporting ? (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 border border-primary/20">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-lg font-bold">Faça o upload do seu CSV</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Baixe o modelo com as colunas de Projeto, Nicho, Subnicho e Objetivo e envie para conferência antes de salvar.
                    </p>
                  </div>

                  <div className="max-w-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-sm text-xs font-medium text-amber-800 dark:text-amber-500 text-left shadow-sm">
                    <strong className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-4 h-4" /> Importante: Separador por ponto e vírgula
                    </strong>
                    Evite utilizar o caractere de <strong>ponto e vírgula ( ; )</strong> dentro dos textos, pois ele delimita as colunas da tabela.
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <button onClick={downloadTemplate} className="h-10 px-4 py-2 border border-border bg-background text-foreground text-sm font-semibold rounded-sm hover:bg-muted transition-colors flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" /> Modelo CSV
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} className="h-10 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Selecionar Arquivo
                    </button>
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex justify-between items-center text-sm">
                    <span className="font-semibold text-amber-900 dark:text-amber-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Conferência Necessária: {draftRows.length} linha(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm text-left whitespace-nowrap border border-border rounded-sm overflow-hidden bg-card">
                      <thead className="bg-muted text-muted-foreground text-[11px] uppercase font-bold border-b border-border tracking-wider">
                        <tr>
                          <th className="px-3 py-3">Objetivo</th>
                          <th className="px-3 py-3">Projeto</th>
                          <th className="px-3 py-3">Nicho</th>
                          <th className="px-3 py-3">Subnicho</th>
                          <th className="px-3 py-3 text-center">Conferência</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {draftRows.map((row, idx) => (
                          <tr key={row.id} className={`transition-colors ${row.isVerified ? "bg-emerald-50/40 dark:bg-emerald-950/20" : "hover:bg-muted/30"}`}>
                            <td className="px-3 py-2">
                              <select
                                value={row.currentObjective}
                                onChange={(e) => updateRow(idx, "currentObjective", e.target.value)}
                                disabled={row.isVerified}
                                className="h-8 rounded-sm border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary disabled:opacity-70 font-semibold"
                              >
                                <option value="autoridade">Autoridade</option>
                                <option value="branding">Branding</option>
                                <option value="conversao">Conversão</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => updateRow(idx, "name", e.target.value)}
                                disabled={row.isVerified}
                                className="h-8 w-full min-w-[200px] rounded-sm border-transparent bg-transparent px-2 text-sm focus:border-primary focus:bg-background disabled:opacity-70"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.niche}
                                onChange={(e) => updateRow(idx, "niche", e.target.value)}
                                disabled={row.isVerified}
                                className="h-8 w-full min-w-[140px] rounded-sm border-transparent bg-transparent px-2 text-sm focus:border-primary focus:bg-background disabled:opacity-70"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.subniche}
                                onChange={(e) => updateRow(idx, "subniche", e.target.value)}
                                disabled={row.isVerified}
                                className="h-8 w-full min-w-[140px] rounded-sm border-transparent bg-transparent px-2 text-sm focus:border-primary focus:bg-background disabled:opacity-70"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => toggleVerify(idx)}
                                className={`h-8 px-3 rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-24 mx-auto border ${row.isVerified ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" : "bg-background text-muted-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary border-border"}`}
                              >
                                {row.isVerified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Ok</> : "Conferir"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border bg-background flex items-center justify-between">
              {isImporting ? (
                <button onClick={cancelImport} className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                  <Trash2 className="w-4 h-4" /> Descartar Tudo
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleFinalSubmit}
                disabled={(!allVerified && isImporting) || isSubmitting || !isImporting}
                className="h-10 px-6 bg-foreground text-background text-sm font-bold rounded-sm hover:bg-foreground/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {allVerified ? "Salvar no Sistema" : isImporting ? "Verifique todas as linhas" : "Aguardando Arquivo"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}