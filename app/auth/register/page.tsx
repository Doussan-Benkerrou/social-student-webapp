"use client";
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { registerSchema, RegisterSchema } from "../../../lib/validations/authSchemas"
import { register as registerAction } from "../../../services/authService"
import { AuthPageWrapper, Button, InputField, PasswordInput, FormError } from "@/components/ui"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [justRegistered, setJustRegistered] = useState(false);
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const password = watch("password");
  const confirm_mot_de_passe = watch("confirm_mot_de_passe");

  const onSubmit = async (data: RegisterSchema) => {
    setError("");
    setLoading(true);
    const result = await registerAction(data);
    if (!result.success) {
      setError(result.message || "Erreur");
      setLoading(false);
      return;
    }
    setJustRegistered(true);
    setLoading(false);
  };

  return (
    <AuthPageWrapper maxWidth="max-w-lg">
      <div className="card p-8 animate-slide-up">
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">
          Créer un compte 🎓
        </h2>
        <p className="text-slate-500 font-body text-sm mb-6">
          Remplissez vos informations personnelles.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              {(["nom", "prenom"] as const).map((k) => (
                <InputField
                  key={k}
                  label={k === "nom" ? "Nom" : "Prénom"}
                  type="text"
                  placeholder={k === "nom" ? "Benali" : "Amira"}
                  error={errors[k]?.message}
                  {...registerField(k)}
                />
              ))}
            </div>

            <InputField
              label="Email universitaire"
              type="email"
              placeholder="prenom.nom@univ.edu.dz"
              error={errors.email_univer?.message}
              {...registerField("email_univer")}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Date de naissance"
                type="date"
                error={errors.date_naissance?.message}
                {...registerField("date_naissance")}
              />
              <div>
                <label className="input-label">Sexe</label>
                <select {...registerField("sexe")} className="input-field bg-white appearance-none">
                  <option value="">Sélectionner</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
                {errors.sexe && <p className="text-xs text-red-500 mt-1">{errors.sexe.message}</p>}
              </div>
            </div>

            <InputField
              label="Numéro de téléphone"
              type="tel"
              placeholder="0555 123 456"
              error={errors.numero_tel?.message}
              {...registerField("numero_tel")}
            />

            <InputField
              label="Adresse"
              type="text"
              placeholder="Sétif, Algérie"
              error={errors.adresse?.message}
              {...registerField("adresse")}
            />

            <PasswordInput
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              showStrengthBar
              value={password ?? ""}
              error={errors.password?.message}
              {...registerField("password")}
            />

            <PasswordInput
              label="Confirmer le mot de passe"
              placeholder="Répétez votre mot de passe"
              error={
                errors.confirm_mot_de_passe?.message ||
                (confirm_mot_de_passe && confirm_mot_de_passe !== password
                  ? "Les mots de passe ne correspondent pas."
                  : undefined)
              }
              {...registerField("confirm_mot_de_passe")}
            />

            <Button loading={loading} loadingText="Chargement..." icon={<ArrowRight size={16} />}>
              Créer le compte
            </Button>
            <FormError message={error} />
            {justRegistered && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm font-body text-emerald-700">
                  Compte créé ! Vérifiez votre email pour confirmer votre inscription.
                </p>
              </div>
            )}
          </div>
        </form>

        <p className="text-center text-sm font-body text-slate-500 mt-6">
          Déjà inscrit ?{" "}
          <Link href="/auth/login" className="font-display font-semibold text-brand-600 hover:text-brand-800 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </AuthPageWrapper>
  );
}