import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}


export function Button({
  loading = false,
  loadingText = "Chargement...",
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`btn-primary w-full justify-center py-3 disabled:opacity-60 flex items-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}