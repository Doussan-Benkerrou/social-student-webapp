"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ForgotPasswordSchema, forgotPasswordSchema } from "@/lib/validations/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/services/authService";
import { AuthPageWrapper, Button, InputField, FormError } from "@/components/ui";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [submittedEmail, setSubmittedEmail] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data: ForgotPasswordSchema) => {
        setError("");
        setLoading(true);
        const result = await forgotPassword(data.email_univer);
        if (!result.success) {
            setError(result.message || "Une erreur est survenue");
            setLoading(false);
            return;
        }
        setSubmittedEmail(data.email_univer);
        setSent(true);
        setLoading(false);
    };

    return (
        <AuthPageWrapper>
            <div className="card p-8 animate-slide-up">
                {!sent ? (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-7 h-7 text-brand-600" />
                        </div>
                        <h2 className="font-display font-bold text-2xl text-slate-900 text-center mb-2">
                            Mot de passe oublié ?
                        </h2>
                        <p className="text-slate-500 font-body text-sm text-center mb-8">
                            Entrez votre email universitaire et nous vous enverrons un lien de réinitialisation.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <InputField
                                label="Email universitaire"
                                type="email"
                                placeholder="prenom.nom@univ.edu.dz"
                                error={errors.email_univer?.message}
                                {...register("email_univer")}
                            />
                            <Button loading={loading} loadingText="Envoi en cours...">
                                Envoyer le lien
                            </Button>
                            <FormError message={error} />
                        </form>
                    </>
                ) : (
                    <div className="text-center animate-slide-up">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">Email envoyé !</h2>
                        <p className="text-slate-500 font-body text-sm mb-2">
                            Un lien de réinitialisation a été envoyé à
                        </p>
                        <p className="font-display font-semibold text-brand-700 text-sm mb-8">{submittedEmail}</p>
                        <p className="text-xs text-slate-400 font-body mb-6">
                            Vérifiez votre boîte mail et vos spams. Le lien est valable 30 minutes.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="text-sm font-display font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                        >
                            Renvoyer le lien
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-sm font-display font-semibold text-slate-500 hover:text-brand-700 transition-colors"
                    >
                        <ArrowLeft size={14} /> Retour à la connexion
                    </Link>
                </div>
            </div>
        </AuthPageWrapper>
    );
}