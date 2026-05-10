import Sidebar from './Sidebar'
import TopBar from "./TopBar";
import type { ResponseType } from "@/lib/types";
import { BlockListProvider } from "@/hooks/useBlockList";

interface AppLayoutProps {
    children: React.ReactNode;
    curUser?: ResponseType;
}

export default function AppLayout({ children, curUser }: AppLayoutProps) {
    return (
        <BlockListProvider>
            <div className="min-h-screen bg-slate-50">
                <Sidebar curUser={curUser} />
                <TopBar curUser={curUser} />
                <main className="ml-64 pt-16 min-h-screen">
                    <div className="animate-fade-in">{children}</div>
                </main>
            </div>
        </BlockListProvider>
    );
}