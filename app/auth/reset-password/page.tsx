"use client";
import { useState } from "react";
import { KeyRound, ArrowRight } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";
import { ResetPasswordSchema, resetPasswordSchema } from "@/lib/validations/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/services/authService";
import { AuthPageWrapper, Button, PasswordInput, FormError } from "@/components/ui";

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const new_password = watch("new_password");
    const confirm_mot_de_passe = watch("confirm_mot_de_passe");

    const onSubmit = async (data: ResetPasswordSchema) => {
        setError("");
        setLoading(true);
        const result = await resetPassword(data);
        if (!result.success) {
            setError(result.message || "Une erreur est survenue");
            setLoading(false);
            return;
        }
        router.push("/auth/login");
    };

    return (
        <AuthPageWrapper>
            <div className="card p-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-6">
                    <KeyRound className="w-7 h-7 text-brand-600" />
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900 text-center mb-2">
                    Nouveau mot de passe
                </h2>
                <p className="text-slate-500 font-body text-sm text-center mb-8">
                    Choisissez un mot de passe sécurisé.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <PasswordInput
                        label="Nouveau mot de passe"
                        placeholder="Minimum 8 caractères"
                        error={errors.new_password?.message}
                        {...registerField("new_password")}
                    />

                    <PasswordInput
                        label="Confirmer le mot de passe"
                        placeholder="Répétez le mot de passe"
                        error={
                            errors.confirm_mot_de_passe?.message ||
                            (!errors.confirm_mot_de_passe && confirm_mot_de_passe && confirm_mot_de_passe !== new_password
                                ? "Les mots de passe ne correspondent pas."
                                : undefined)
                        }
                        {...registerField("confirm_mot_de_passe")}
                    />

                    <FormError message={error} />

                    <Button loading={loading} loadingText="Chargement..." icon={<ArrowRight size={16} />}>
                        Réinitialiser
                    </Button>
                </form>
            </div>
        </AuthPageWrapper>
    );
}