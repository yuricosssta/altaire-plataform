//src/components/dashboard/ActivityLog.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Edit2, FileText, Loader2, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { editorialService } from "@/lib/services/editorialService";

interface EditorialTimelineItem {
  id: string;
  projectId?: string;
  projectName: string;
  label: string;
  resourceHref?: string;
  occurredAt: string;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recentemente";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Agora mesmo";
  if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 172800) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

const getEventIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("tema") || lower.includes("calend")) {
    return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (lower.includes("roteiro")) {
    return <FileText className="w-3.5 h-3.5 text-purple-400" />;
  }
  return <Edit2 className="w-3.5 h-3.5 text-emerald-400" />;
};

export function ActivityLog() {
  const [events, setEvents] = useState<EditorialTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    let cancelled = false;
    const fetchTimeline = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const list = await editorialService.listActivity(undefined, 30);
        if (cancelled) return;
        const mapped: EditorialTimelineItem[] = Array.isArray(list)
          ? list.map((item: any) => ({
              id: String(item.id || item._id || Math.random()),
              projectId: item.projectId ? String(item.projectId) : undefined,
              projectName: String(item.projectName || "Projeto Editorial"),
              label: String(item.label || "Atualização editorial"),
              resourceHref: item.resourceHref ? String(item.resourceHref) : undefined,
              occurredAt: String(
                item.occurredAt || item.createdAt || new Date().toISOString()
              ),
            }))
          : [];
        setEvents(mapped);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchTimeline();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          Atividades Recentes
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitoramento da operação editorial em tempo real.
        </p>
      </div>

      <div className="flex-1 rounded-sm border border-border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Sincronizando atividades...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade editorial registrada ainda neste workspace.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-0">
            <ul className="divide-y divide-border">
              {events.map((event) => {
                const initials = event.projectName.slice(0, 2).toUpperCase();
                return (
                  <li key={event.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-xs border border-border">
                        {initials}
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border shadow-sm">
                        {getEventIcon(event.label)}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-semibold">{event.projectName}</span>{" "}
                        <span className="text-muted-foreground">— {event.label}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {getRelativeTime(event.occurredAt)}
                        </span>
                        {event.resourceHref ? (
                          <Link
                            href={event.resourceHref}
                            className="text-[11px] font-medium text-primary hover:underline"
                          >
                            Abrir →
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}