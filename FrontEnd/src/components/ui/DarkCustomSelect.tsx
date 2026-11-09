// FrontEnd/src/components/ui/DarkCustomSelect.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

export type CustomSelectOption<T extends string = string> = {
  readonly value: T;
  readonly label: string;
  readonly badge?: string;
  readonly hint?: string;
};

export interface DarkCustomSelectProps<T extends string = string> {
  readonly value: T;
  readonly options: readonly CustomSelectOption<T>[];
  readonly onChange: (value: T) => void;
  readonly icon?: LucideIcon;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly align?: "left" | "right";
  readonly menuZIndex?: string;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export function DarkCustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  icon: Icon,
  placeholder = "Selecione uma opção",
  disabled = false,
  fullWidth = false,
  align = "left",
  menuZIndex = "z-[250]",
  className,
  ariaLabel,
}: DarkCustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? null;

  /* Fecha ao clicar fora ou pressionar Escape */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative select-none",
        isOpen ? menuZIndex : "z-10",
        fullWidth ? "w-full" : "w-auto",
        className
      )}
    >
      {/* Botão Gatilho (Trigger) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? selectedOption?.label ?? placeholder}
        className={clsx(
          "group flex min-h-[2.625rem] w-full items-center justify-between gap-2.5 rounded-la-md border px-3.5 py-2 font-la-sans text-xs transition-all duration-150",
          isOpen
            ? "border-la-border-gold/80 bg-[#0E131F] text-la-gold-light shadow-[0_0_16px_rgba(207,169,101,0.18)] ring-1 ring-la-gold/30"
            : "border-white/12 bg-black/55 text-la-text-primary hover:border-la-border-gold/50 hover:bg-[#0B0F18]",
          disabled && "cursor-not-allowed opacity-55 hover:border-white/12"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon
              className={clsx(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isOpen
                  ? "text-la-gold"
                  : "text-la-text-muted group-hover:text-la-gold-light"
              )}
            />
          ) : null}

          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "h-3.5 w-3.5 shrink-0 text-la-text-muted transition-transform duration-200 group-hover:text-la-gold-light",
            isOpen && "rotate-180 text-la-gold"
          )}
        />
      </button>

      {/* Painel Flutuante Suspenso (Dropdown Glassmorphism Dark-First) */}
      {isOpen ? (
        <div
          role="listbox"
          tabIndex={-1}
          className={clsx(
            "absolute mt-1.5 max-h-64 min-w-full w-max max-w-[90vw] overflow-y-auto rounded-la-lg border border-la-border-gold/50 bg-[#090C14]/98 p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.95),0_0_28px_rgba(207,169,101,0.14)] backdrop-blur-2xl scrollbar-none animate-in fade-in zoom-in-95 duration-150",
            menuZIndex,
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  "group flex w-full items-center justify-between gap-3 rounded-la-xs px-3 py-2 text-left font-la-sans text-xs transition-colors",
                  isSelected
                    ? "border border-la-border-gold/50 bg-la-gold-faint font-semibold text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.1)]"
                    : "border border-transparent text-la-text-secondary hover:bg-white/[0.05] hover:text-la-text-primary"
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                      {option.hint}
                    </span>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {option.badge ? (
                    <span className="rounded-la-full border border-white/10 bg-black/45 px-1.5 py-0.5 font-la-mono text-[0.5625rem] text-la-text-muted">
                      {option.badge}
                    </span>
                  ) : null}

                  {isSelected ? (
                    <Check
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-la-gold"
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default DarkCustomSelect;