import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    labelSuffix?: ReactNode;
}


export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, labelSuffix, className = "", ...props }, ref) => {
        return (
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="input-label mb-0">{label}</label>
                    {labelSuffix}
                </div>
                <input
                    ref={ref}
                    className={`input-field ${error ? "border-red-300 focus:ring-red-200" : ""} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-xs mt-1 font-body">{error}</p>
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";