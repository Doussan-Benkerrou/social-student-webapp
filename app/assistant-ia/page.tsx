import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/services/SessionService";
import AssistantClient from "./AssistantClient";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {

    const curUser = await getCurrentUser();
    if (!curUser.success) redirect("/auth/login");

    const geminiConfig = {
        chatModel: process.env.NEXT_PUBLIC_GEMINI_CHAT_MODEL || process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash",
        imageModel: process.env.NEXT_PUBLIC_GEMINI_IMAGE_MODEL || process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
    };

    return (
        <AppLayout curUser={curUser}>
            <AssistantClient geminiConfig={geminiConfig} />
        </AppLayout>
    );
}
