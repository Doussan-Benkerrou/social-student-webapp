import type { AssistantMessage } from "@/lib/types";

const MAX_PROMPT_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;

export function validateAssistantChatPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return "Le message ne peut pas être vide.";
    if (trimmed.length > MAX_PROMPT_LENGTH) {
        return `Le message dépasse la limite de ${MAX_PROMPT_LENGTH} caractères.`;
    }
    return null;
}

export function validateAssistantImagePrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return "Le prompt image ne peut pas être vide.";
    if (trimmed.length > MAX_PROMPT_LENGTH) {
        return `Le prompt image dépasse la limite de ${MAX_PROMPT_LENGTH} caractères.`;
    }
    return null;
}

export function sanitizeAssistantHistory(history: AssistantMessage[]) {
    return history
        .slice(-MAX_HISTORY_MESSAGES)
        .filter((message) => message.content.trim())
        .map((message) => ({
            ...message,
            content: message.content.trim().slice(0, MAX_PROMPT_LENGTH),
        }));
}
