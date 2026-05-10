import { GraduationCap } from "lucide-react";

interface LogoProps {
    showText?: boolean;
    className?: string;
}

export function Logo({ showText = true, className = "" }: LogoProps) {
    return (
        <div className={`flex items-center gap-2.5 justify-center ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {showText && (
                <span className="font-display font-bold text-xl text-brand-900">uniYo</span>
            )}
        </div>
    );
}