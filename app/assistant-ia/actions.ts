"use server";

import { randomUUID } from "crypto";
import type {
    AssistantChatActionResult,
    AssistantImageActionResult,
    AssistantMessage,
} from "@/lib/types";
import {
    sanitizeAssistantHistory,
    validateAssistantChatPrompt,
    validateAssistantImagePrompt,
} from "@/lib/validations/assistant";
import {
    generateGeminiChatReply,
    generateGeminiImage,
} from "@/services/geminiService";

export async function sendAssistantChatMessageAction(
    history: AssistantMessage[]
): Promise<AssistantChatActionResult> {
    try {
        const sanitizedHistory = sanitizeAssistantHistory(history);
        const latestMessage = sanitizedHistory[sanitizedHistory.length - 1];

        if (!latestMessage || latestMessage.role !== "user") {
            return { success: false, error: "Le dernier message utilisateur est introuvable." };
        }

        const validationError = validateAssistantChatPrompt(latestMessage.content);
        if (validationError) {
            return { success: false, error: validationError };
        }

        const reply = await generateGeminiChatReply(sanitizedHistory);

        return {
            success: true,
            message: {
                id: randomUUID(),
                role: "assistant",
                content: reply,
                createdAt: new Date().toISOString(),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "La génération de réponse a échoué.",
        };
    }
}

export async function generateAssistantImageAction(
    prompt: string
): Promise<AssistantImageActionResult> {
    try {
        const validationError = validateAssistantImagePrompt(prompt);
        if (validationError) {
            return { success: false, error: validationError };
        }

        const image = await generateGeminiImage(prompt.trim());
        return { success: true, image };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "La génération d'image a échoué.",
        };
    }
}
