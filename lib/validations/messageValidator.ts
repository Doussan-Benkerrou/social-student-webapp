import { z } from 'zod'


export const sendMessageSchema = z.object({
    content: z
        .string({ required_error: 'Le contenu est requis' })
        .min(1, 'Le message ne peut pas être vide')
        .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
        .trim(),

    id_discussion: z
        .number({ required_error: "L'id de la discussion est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),

    id_sender: z
        .number({ required_error: "L'id de l'expéditeur est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif")

})


export const deleteMessageSchema = z.object({
    id_message: z
        .number({ required_error: "L'id du message est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
        

    id_sender: z
        .number({ required_error: "L'id de l'expéditeur est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif")
       
})

export const getMessagesPaginatedSchema = z.object({
    id_discussion: z
        .number({ required_error: "L'id de la discussion est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),

    page: z
        .number()
        .int('La page doit être un entier')
        .min(0, 'La page doit être >= 0')
        .default(0),

    limit: z
        .number()
        .int('La limite doit être un entier')
        .min(1, 'La limite doit être >= 1')
        .max(100, 'La limite ne peut pas dépasser 100')
        .default(20),
})


export type SendMessageInput       = z.infer<typeof sendMessageSchema>
export type DeleteMessageInput     = z.infer<typeof deleteMessageSchema>
export type GetMessagesPaginatedInput = z.infer<typeof getMessagesPaginatedSchema>


export function validateSendMessage(data: unknown) {
    const result = sendMessageSchema.safeParse(data)
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.flatten().fieldErrors,
        }
    }
    return { success: true as const, data: result.data }
}


export function validateDeleteMessage(data: unknown) {
    const result = deleteMessageSchema.safeParse(data)
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.flatten().fieldErrors,
        }
    }
    return { success: true as const, data: result.data }
}


export function validateGetMessagesPaginated(data: unknown) {
    const result = getMessagesPaginatedSchema.safeParse(data)
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.flatten().fieldErrors,
        }
    }
    return { success: true as const, data: result.data }
}