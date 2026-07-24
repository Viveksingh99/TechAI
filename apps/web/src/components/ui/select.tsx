"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  labels: Map<string, React.ReactNode>;
  registerLabel: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select>");
  return ctx;
}

function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [labels] = React.useState(() => new Map<string, React.ReactNode>());

  const currentValue = value ?? internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const registerLabel = React.useCallback(
    (val: string, label: React.ReactNode) => {
      labels.set(val, label);
    },
    [labels]
  );

  return (
    <SelectContext.Provider
      value={{ value: currentValue, setValue, open, setOpen, labels, registerLabel }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { open, setOpen } = useSelectContext();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!ref.current?.parentElement?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labels } = useSelectContext();
  const label = value ? labels.get(value) ?? value : undefined;
  return (
    <span className={cn("truncate", !label && "text-muted-foreground")}>
      {label ?? placeholder}
    </span>
  );
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSelectContext();
  if (!open) return null;
  return (
    <div
      role="listbox"
      className={cn(
        "absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
    </div>
  );
}

function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: selected, setValue, setOpen, registerLabel } = useSelectContext();
  React.useEffect(() => {
    registerLabel(value, children);
  }, [value, children, registerLabel]);

  const isSelected = selected === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => {
        setValue(value);
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary",
        isSelected && "bg-secondary",
        className
      )}
    >
      {children}
      {isSelected && <Check className="h-4 w-4 text-primary" />}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
