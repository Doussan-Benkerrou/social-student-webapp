import { Logo } from "./Logo";

interface AuthPageWrapperProps {
  children: React.ReactNode;
  maxWidth?: "max-w-md" | "max-w-lg";
}


export function AuthPageWrapper({
  children,
  maxWidth = "max-w-md",
}: AuthPageWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className={`w-full ${maxWidth}`}>
        <Logo className="mb-8" />
        {children}
      </div>
    </div>
  );
}