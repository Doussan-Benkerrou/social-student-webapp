import type { UserProfileUpdate } from "@/lib/types";

export function validateProfileInput(input: UserProfileUpdate) {
    if (!input.nom.trim()) return "Le nom est obligatoire.";
    if (!input.prenom.trim()) return "Le prénom est obligatoire.";
    if (!input.email_univer.trim()) return "L'email universitaire est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email_univer)) {
        return "L'email universitaire est invalide.";
    }
    if (!input.numero_tel.trim()) return "Le numéro de téléphone est obligatoire.";
    if (!input.adresse.trim()) return "L'adresse est obligatoire.";
    return null;
}
