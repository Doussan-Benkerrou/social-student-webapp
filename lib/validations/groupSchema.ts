import { z } from "zod";

export const groupSchema = z.object({
    nameGroup: z
        .string()
        .trim()
        .min(1, { message: "Name is required" }),

    description: z
        .string()
        .trim()
        .min(1, { message: "Description is required" }),
});

export type GroupSchema = z.infer<typeof groupSchema>;