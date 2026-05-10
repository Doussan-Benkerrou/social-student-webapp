import { z } from "zod";

export const pubSchema = z.object({
    contenu: z.string().min(1, "Le contenu est obligatoire"),
});
export const signaleEditSchema = z.object({
    contenu: z.string().min(1, "Le contenu est obligatoire"),
});
export type PubInput = z.infer<typeof pubSchema>;
export type SignaleEditInput = z.infer<typeof signaleEditSchema>;