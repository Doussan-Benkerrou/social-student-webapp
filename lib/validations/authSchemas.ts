import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email requis" })
        .trim()
        .email({ message: "Le format de l'email est invalide" })
        .regex(/^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z]{1,10}\.univ-bejaia\.dz$/, {
            message: "L'email doit être au format : prenom.nom@faculte.univ-bejaia.dz",
        }),

    password: z
        .string()
        .min(1, { message: "Mot de passe requis" })
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
})

export const forgotPasswordSchema = z.object({
    email_univer: z
        .string()
        .min(1, { message: "Email requis" })
        .trim()
        .email({ message: "Le format de l'email est invalide" })
        .regex(/^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z]{1,10}\.univ-bejaia\.dz$/, {
            message: "L'email doit être au format : prenom.nom@faculte.univ-bejaia.dz",
        }),
})

export const registerSchema = z.object({
    nom: z
        .string()
        .min(1, { message: "Le nom est requis" })
        .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),

    prenom: z
        .string()
        .min(1, { message: "Le prénom est requis" })
        .min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),

    date_naissance: z
        .string()
        .min(1, { message: "La date de naissance est requise" }),

    sexe: z.enum(["homme", "femme"], {
        errorMap: () => ({ message: "Le sexe est requis" }),
    }),

    email_univer: z
        .string()
        .min(1, { message: "Email requis" })
        .trim()
        .email({ message: "Le format de l'email est invalide" })
        .regex(/^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z]{1,10}\.univ-bejaia\.dz$/, {
            message: "L'email doit être au format : prenom.nom@faculte.univ-bejaia.dz",
        }),

    numero_tel: z
        .string()
        .min(1, { message: "Le numéro de téléphone est requis" })
        .min(10, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres" }),

    adresse: z
        .string()
        .min(1, { message: "L'adresse est requise" })
        .min(5, { message: "L'adresse doit contenir au moins 5 caractères" }),

    password: z
        .string()
        .min(1, { message: "Le mot de passe est requis" })
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),

    confirm_mot_de_passe: z
        .string()
        .min(1, { message: "La confirmation du mot de passe est requise" }),
}).refine((data) => data.password === data.confirm_mot_de_passe, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_mot_de_passe"],
})

export const resetPasswordSchema = z.object({
    new_password: z
        .string()
        .min(1, { message: "Le mot de passe est requis" })
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),

    confirm_mot_de_passe: z
        .string()
        .min(1, { message: "La confirmation du mot de passe est requise" }),
}).refine((data) => data.new_password === data.confirm_mot_de_passe, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_mot_de_passe"],
})


export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>