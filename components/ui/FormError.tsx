import { CheckCircle2, XCircle } from "lucide-react";

interface FormErrorProps {
    message?: string;
}

export function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 mb-6">
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-body text-red-700">
                {message}
            </p>
        </div>
    );
}