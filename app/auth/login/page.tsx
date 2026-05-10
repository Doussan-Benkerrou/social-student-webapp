"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, ArrowRight } from "lucide-react"
import { LoginSchema, loginSchema } from "@/lib/validations/authSchemas"
import { useRouter } from "next/navigation"
import { loginWithEmail } from "@/services/authService"
import { Button, InputField, PasswordInput } from "@/components/ui"
import { useToast } from "@/hooks/UseToast"
import Toast from "@/components/ui/Toast"

export default function LoginForm() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const { handleSubmit, formState: { errors, isSubmitting }, register } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await loginWithEmail(data);
    if (!result.success) {
      showToast(result.message || "Erreur", 'error');
      return;
    }
    router.push("/dashboard");
    router.refresh()
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="min-h-screen flex">
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 relative overflow-hidden flex-col items-center justify-center p-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full border-2 border-white" />
            <div className="absolute top-40 left-32 w-40 h-40 rounded-full border border-white" />
            <div className="absolute bottom-32 right-20 w-80 h-80 rounded-full border-2 border-white" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full border border-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white opacity-30" />
          </div>
          <div className="absolute top-16 right-16 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">KM</div>
              <div>
                <div className="h-2 w-20 bg-white/30 rounded mb-1" />
                <div className="h-1.5 w-14 bg-white/20 rounded" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-24 left-12 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/80 text-sm">❤️ 142 j&apos;aimes</span>
            </div>
            <div className="h-1.5 w-32 bg-white/20 rounded mb-1" />
            <div className="h-1.5 w-24 bg-white/20 rounded" />
          </div>

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Image 
                src="/images/logo_uniyo.jpg"
                alt="UniYo Logo"
                width={150}
                height={150}
                className="object-contain rounded-xl"
              />
            </div>
            <h1 className="font-display font-bold text-4xl text-white mb-4 text-balance">uniYo</h1>
            <p className="text-brand-200 text-lg font-body leading-relaxed max-w-xs">
              Le réseau social dédié aux étudiants. Connectez-vous, partagez, évoluez ensemble.
            </p>
            <div className="flex items-center justify-center gap-6 mt-10">
              {["📚 Cours", "👥 Groupes", "💬 Messages"].map((item) => (
                <div key={item} className="text-center">
                  <div className="bg-white/10 rounded-xl px-4 py-2 text-white text-sm font-display font-semibold border border-white/20">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-brand-900">uniYo</span>
            </div>

            <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">Bon retour ! 👋</h2>
            <p className="text-slate-500 font-body mb-8">Connectez-vous à votre espace étudiant.</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <InputField
                  label="Email universitaire"
                  type="email"
                  placeholder="prenom.nom@specialite.univ-bejaia.dz"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                  onChange={(e) => { register("email").onChange(e) }}
                />

                <PasswordInput
                  label="Mot de passe"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  labelSuffix={
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-display font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  }
                  {...register("password")}
                  onChange={(e) => { register("password").onChange(e) }}
                />

                <Button loading={isSubmitting} loadingText="Chargement..." icon={<ArrowRight size={16} />}>
                  Se connecter
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-body text-slate-500">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="font-display font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}