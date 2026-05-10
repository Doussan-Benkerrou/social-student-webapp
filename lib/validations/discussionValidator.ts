import { z } from 'zod'


export const createPrivateDiscussionSchema = z.object({
    id_user1: z
        .number({ required_error: "L'id du user1 est requis" })
        .int("L'id doit être un entier"),

    id_user2: z
        .number({ required_error: "L'id du user2 est requis" })
        .int("L'id doit être un entier"),
})

.refine(
    (data) => data.id_user1 !== data.id_user2,
    { message: 'Vous ne pouvez pas créer une discussion avec vous-meme', path: ['id_user2'] }
)


export const createGroupDiscussionSchema = z.object({
    id_groupe: z
        .number({ required_error: "L'id du groupe est requis" })
        .int("L'id doit être un entier")
        .positive("L'id du groupe doit etre positif"),
})


export const getDiscussionByIdSchema = z.object({
    id_discussion: z
        .number({ required_error: "L'id de la discussion est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
})


export const getDiscussionsByUserSchema = z.object({
    id_user: z
        .number({ required_error: "L'id du user est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
})


export const getDiscussionsByGroupSchema = z.object({
    id_groupe: z
        .number({ required_error: "L'id du groupe est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
})


export const deleteDiscussionSchema = z.object({
    id_discussion: z
        .number({ required_error: "L'id de la discussion est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),

    id_requester: z
        .number({ required_error: "L'id du demandeur est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
})


export const accessDiscussionSchema = z.object({
    id_discussion: z
        .number({ required_error: "L'id de la discussion est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),

    id_requester: z
        .number({ required_error: "L'id du demandeur est requis" })
        .int("L'id doit être un entier")
        .positive("L'id doit être positif"),
})


export type CreatePrivateDiscussionInput = z.infer<typeof createPrivateDiscussionSchema>
export type CreateGroupDiscussionInput   = z.infer<typeof createGroupDiscussionSchema>
export type GetDiscussionByIdInput       = z.infer<typeof getDiscussionByIdSchema>
export type GetDiscussionsByUserInput    = z.infer<typeof getDiscussionsByUserSchema>
export type GetDiscussionsByGroupInput   = z.infer<typeof getDiscussionsByGroupSchema>
export type DeleteDiscussionInput        = z.infer<typeof deleteDiscussionSchema>
export type AccessDiscussionInput        = z.infer<typeof accessDiscussionSchema>



export function validateCreatePrivateDiscussion(data: unknown) {
    const result = createPrivateDiscussionSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateCreateGroupDiscussion(data: unknown) {
    const result = createGroupDiscussionSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateGetDiscussionById(data: unknown) {
    const result = getDiscussionByIdSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateGetDiscussionsByUser(data: unknown) {
    const result = getDiscussionsByUserSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateGetDiscussionsByGroup(data: unknown) {
    const result = getDiscussionsByGroupSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateDeleteDiscussion(data: unknown) {
    const result = deleteDiscussionSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}


export function validateAccessDiscussion(data: unknown) {
    const result = accessDiscussionSchema.safeParse(data)
    if (!result.success) {
        return { success: false as const, errors: result.error.flatten().fieldErrors }
    }
    return { success: true as const, data: result.data }
}