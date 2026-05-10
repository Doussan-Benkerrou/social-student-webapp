import "server-only";

import type {
    AssistantMessage,
    GeminiAssistantConfig,
    GeminiImageResult,
} from "@/lib/types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_CHAT_MODEL =
    process.env.GEMINI_CHAT_MODEL ||
    process.env.NEXT_PUBLIC_GEMINI_CHAT_MODEL ||
    "gemini-2.5-flash";
const DEFAULT_IMAGE_MODEL =
    process.env.GEMINI_IMAGE_MODEL ||
    process.env.NEXT_PUBLIC_GEMINI_IMAGE_MODEL ||
    "gemini-2.5-flash-image";

interface GeminiPart {
    text?: string;
    inlineData?: {
        mimeType?: string;
        data?: string;
    };
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: GeminiPart[];
        };
    }>;
    promptFeedback?: {
        blockReason?: string;
    };
    error?: {
        message?: string;
    };
}

function getGeminiApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY est requis pour utiliser l'assistant IA.");
    }
    return apiKey;
}

export function getGeminiAssistantConfig(): GeminiAssistantConfig {
    return {
        chatModel: DEFAULT_CHAT_MODEL,
        imageModel: DEFAULT_IMAGE_MODEL,
    };
}

async function callGeminiModel(model: string, body: Record<string, unknown>) {
    const apiKey = getGeminiApiKey();
    const response = await fetch(
        `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
        }
    );

    const payload = (await response.json()) as GeminiResponse;

    if (!response.ok) {
        throw new Error(
            payload?.error?.message ||
            "L'appel Gemini a échoué. Vérifiez votre clé API et votre quota."
        );
    }

    if (payload.promptFeedback?.blockReason) {
        throw new Error(`La requête a été bloquée par Gemini (${payload.promptFeedback.blockReason}).`);
    }

    return payload;
}

function extractText(parts: GeminiPart[] | undefined) {
    if (!parts?.length) return "";

    return parts
        .map((part) => part.text?.trim())
        .filter(Boolean)
        .join("\n\n")
        .trim();
}

export async function generateGeminiChatReply(history: AssistantMessage[]) {
    const config = getGeminiAssistantConfig();
    const contents = history.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
    }));

    const payload = await callGeminiModel(config.chatModel, {
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
        },
    });

    const parts = payload.candidates?.[0]?.content?.parts;
    const text = extractText(parts);

    if (!text) {
        throw new Error("Gemini n'a pas renvoyé de réponse textuelle exploitable pour le chat.");
    }

    return text;
}

export async function generateGeminiImage(prompt: string) {
    const config = getGeminiAssistantConfig();

    const payload = await callGeminiModel(config.imageModel, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.8,
        },
    });

    const parts = payload.candidates?.[0]?.content?.parts || [];
    const text = extractText(parts);
    const imagePart = parts.find((part) => part.inlineData?.data);
    const mimeType = imagePart?.inlineData?.mimeType || "image/png";
    const base64 = imagePart?.inlineData?.data;

    if (!base64) {
        throw new Error(
            text ||
            "Gemini n'a pas renvoyé d'image. Vérifiez votre quota ou reformulez le prompt."
        );
    }

    const result: GeminiImageResult = {
        imageDataUrl: `data:${mimeType};base64,${base64}`,
        mimeType,
        text,
    };

    return result;
}
