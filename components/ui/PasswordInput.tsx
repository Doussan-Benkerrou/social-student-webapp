import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    labelSuffix?: ReactNode;
    showStrengthBar?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    (
        {
            label,
            error,
            labelSuffix,
            showStrengthBar = false,
            value,
            className = "",
            ...props
        },
        ref
    ) => {
        const [show, setShow] = useState(false);

        const passwordValue = typeof value === "string" ? value : "";

        return (
            <div>
                <div className="flex items-center justify-between">
                    <label className="input-label">{label}</label>
                    {labelSuffix}
                </div>

                <div className="relative">
                    <input
                        ref={ref}
                        type={show ? "text" : "password"}
                        value={value}
                        className={`input-field pr-12 ${error ? "border-red-300 focus:ring-red-200" : ""
                            } ${className}`}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setShow((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={show ? "Hide password" : "Show password"}
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {showStrengthBar && passwordValue.length > 0 && (
                    <div className="flex gap-1 mt-2" aria-hidden="true">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${passwordValue.length > i * 2 + 3
                                    ? i < 2
                                        ? "bg-red-400"
                                        : i < 3
                                            ? "bg-amber-400"
                                            : "bg-emerald-400"
                                    : "bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {error && <p className="text-xs text-red-500 mt-1 font-body">{error}</p>}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";