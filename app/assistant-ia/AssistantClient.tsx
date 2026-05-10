"use client";

import { useState } from "react";
import type { AssistantMessage, AssistantMode, GeminiAssistantConfig, GeminiImageResult } from "@/lib/types";
import { generateAssistantImageAction, sendAssistantChatMessageAction } from "@/app/assistant-ia/actions";
import {
    Bot,
    Image as ImageIcon,
    Loader2,
    MessageSquare,
    Send,
    Sparkles,
    Wand2,
} from "lucide-react";

function randomId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = {
    geminiConfig: GeminiAssistantConfig;
};

export default function AssistantClient({ geminiConfig }: Props) {
    const [mode, setMode] = useState<AssistantMode>("chat");
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [imagePrompt, setImagePrompt] = useState("");
    const [chatError, setChatError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageResult, setImageResult] = useState<GeminiImageResult | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    async function handleSendMessage() {
        const content = chatInput.trim();
        if (!content || isSending) return;

        const nextMessage: AssistantMessage = {
            id: randomId(),
            role: "user",
            content,
            createdAt: new Date().toISOString(),
        };

        const nextHistory = [...messages, nextMessage];
        setMessages(nextHistory);
        setChatInput("");
        setChatError(null);
        setIsSending(true);

        try {
            const result = await sendAssistantChatMessageAction(nextHistory);
            if (!result.success || !result.message) {
                setChatError(result.error || "La réponse Gemini n'a pas pu être générée.");
                setMessages(messages);
                return;
            }
            setMessages([...nextHistory, result.message]);
        } catch (error) {
            setChatError(error instanceof Error ? error.message : "La réponse Gemini n'a pas pu être générée.");
            setMessages(messages);
        } finally {
            setIsSending(false);
        }
    }

    async function handleGenerateImage() {
        if (!imagePrompt.trim() || isGenerating) return;
        setIsGenerating(true);
        setImageError(null);
        setImageResult(null);

        try {
            const result = await generateAssistantImageAction(imagePrompt);
            if (!result.success || !result.image) {
                setImageError(result.error || "L'image Gemini n'a pas pu être générée.");
                return;
            }
            setImageResult(result.image);
        } catch (error) {
            setImageError(error instanceof Error ? error.message : "L'image Gemini n'a pas pu être générée.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-5">
            <div className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-violet-500 to-brand-700 flex items-center justify-center shadow-sm">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl text-slate-900">Assistant IA</h1>
                            <p className="text-sm font-body text-slate-500 mt-1">Discutez avec Gemini ou générez des images depuis une seule page.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="chip">Chat : {geminiConfig.chatModel}</span>
                        <span className="chip">Image : {geminiConfig.imageModel}</span>
                    </div>
                </div>

                <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                    <button onClick={() => setMode("chat")} className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${mode === "chat" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        <MessageSquare size={16} className="inline mr-2" /> Chat
                    </button>
                    <button onClick={() => setMode("image")} className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${mode === "image" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        <ImageIcon size={16} className="inline mr-2" /> Générer une image
                    </button>
                </div>
            </div>

            {mode === "chat" ? (
                <div className="card p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-display font-bold text-slate-900">Discussion IA</h2>
                            <p className="text-sm font-body text-slate-500">Ce mode utilise {geminiConfig.chatModel} côté serveur.</p>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-brand-600" />
                        </div>
                    </div>

                    <div className="p-6 min-h-[380px] bg-slate-50/70 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-violet-600" />
                                </div>
                                <h3 className="font-display font-bold text-slate-800">Prêt à discuter</h3>
                                <p className="text-sm font-body text-slate-500 mt-2 max-w-md">Envoyez votre premier message pour lancer une vraie réponse Gemini.</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-white border border-slate-100 text-slate-700"}`}>
                                    <p className="text-sm whitespace-pre-wrap font-body">{message.content}</p>
                                </div>
                            ))
                        )}

                        {isSending && (
                            <div className="max-w-[82%] rounded-2xl px-4 py-3 shadow-sm bg-white border border-slate-100 text-slate-600 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-body">Gemini réfléchit...</span>
                            </div>
                        )}

                        {chatError && (
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                                <p className="text-sm font-display font-semibold text-rose-700">{chatError}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex gap-3">
                            <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Écrivez votre message à l’assistant IA..." rows={2} className="input-field resize-none" disabled={isSending} />
                            <button onClick={handleSendMessage} className="btn-primary self-end" disabled={isSending}>
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-display font-bold text-slate-900">Prompt image</h2>
                                <p className="text-sm font-body text-slate-500">Ce mode utilise {geminiConfig.imageModel} côté serveur.</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                <Wand2 className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <textarea value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} placeholder="Décrivez l’image à générer..." rows={7} className="input-field resize-none" disabled={isGenerating} />
                        <button onClick={handleGenerateImage} className="btn-primary" disabled={isGenerating}>
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Générer l’image
                        </button>
                        {imageError && (
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                                <p className="text-sm font-display font-semibold text-rose-700">{imageError}</p>
                            </div>
                        )}
                    </div>

                    <div className="card p-6">
                        <h3 className="font-display font-bold text-slate-900">Résultat généré</h3>
                        <p className="text-sm font-body text-slate-500 mt-1 mb-5">L’image générée par Gemini apparaîtra ici.</p>

                        {isGenerating ? (
                            <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 min-h-[280px] flex flex-col items-center justify-center text-center p-6">
                                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                                <p className="font-display font-semibold text-slate-700">Génération en cours...</p>
                            </div>
                        ) : imageResult?.imageDataUrl ? (
                            <div className="space-y-4">
                                <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={imageResult.imageDataUrl} alt="Image générée par Gemini" className="w-full h-auto block" />
                                </div>
                                {imageResult.text && (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <p className="text-sm font-body text-slate-700 whitespace-pre-wrap">{imageResult.text}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 min-h-[280px] flex flex-col items-center justify-center text-center p-6">
                                <ImageIcon className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="font-display font-semibold text-slate-500">Aucune image générée</p>
                                <p className="text-sm font-body text-slate-400 mt-2">Entrez un prompt puis lancez la génération avec Gemini.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
