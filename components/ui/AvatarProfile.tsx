"use client";

interface AvatarProps {
    initials?: string;
    color?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    src?: string | null;
    isOnline?: boolean;
}

const sizeMap = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
};

export default function Avatar({
    initials = "?",
    color = "from-brand-400 to-brand-700",
    size = "md",
    src,
    isOnline,
}: AvatarProps) {
    return (
        <div className="relative inline-flex shrink-0">
            <div
                className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${color}
          flex items-center justify-center text-white font-display font-bold
          ring-2 ring-white`}
            >
                {src ? (
                    <img
                        src={src}
                        alt={initials}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span className="select-none">{initials}</span>
                )}
            </div>
            {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            )}
        </div>
    );
}