"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { ResponseType } from "@/lib/types";
import { getSafeInitials, getSafeText, INVITATION_EVENT } from "@/lib/utils";
import { useUnreadNotifications } from "@/hooks/useNotification";
import { useTotalUnreadCount } from "@/hooks/useMessages"
import {
    Home, MessageCircle, Users, BookmarkCheck,
    Settings, Bell, Mail, Hash, LogOut
} from "lucide-react";


export const NAV_ITEMS = [
    { href: "/dashboard", icon: Home, label: "Accueil" },
    { href: "/messages", icon: MessageCircle, label: "Mes messages" , badge : 0},
    { href: "/groups", icon: Users, label: "Mes groupes" },
    { href: "/communities", icon: Hash, label: "Communautés" },
    { href: "/favorites", icon: BookmarkCheck, label: "Mes favoris" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/invitations", icon: Mail, label: "Mes invitations"},
    { href: "/settings", icon: Settings, label: "Paramètres" },

];

type Props = { curUser?: ResponseType };

export default function Sidebar({ curUser }: Props) {
    const pathname = usePathname();
    const router   = useRouter();
    const userData = curUser?.data;

    const { unreadNotifications }       = useUnreadNotifications(userData?.id_utilisateur);
    const { total: unreadMessages }     = useTotalUnreadCount(userData?.id_utilisateur ?? 0);
    const [invitationCount, setInvitationCount] = useState(0);

    const profileHref = userData?.id_utilisateur ? `/profile/${userData.id_utilisateur}` : "/profile";

    useEffect(() => {
        const handler = (e: Event) => {
            const { total } = (e as CustomEvent<{ total: number }>).detail;
            setInvitationCount(total);
        };
        window.addEventListener(INVITATION_EVENT, handler);
        return () => window.removeEventListener(INVITATION_EVENT, handler);
    }, []);

    async function handleLogOut() {
        try {
            await createClient().auth.signOut();
            router.push("/auth/login");
        } catch (error) {
            console.error("Erreur de déconnexion", error);
        }
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-sidebar flex flex-col z-30 border-r border-slate-100">
            <div className="px-5 py-5 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center shadow-sm">
                        <Image 
                            src="/images/logo_uniyo.jpg"
                            alt="UniYo Logo"
                            width={35}
                            height={35}
                            className="object-contain rounded-xl"
                        />
                    </div>
                    <div>
                        <span className="font-display font-bold text-brand-900 text-base tracking-tight">uniYo</span>
                        <p className="text-[10px] text-slate-400 font-body -mt-0.5">Réseau étudiant</p>
                    </div>
                </Link>
            </div>

            <Link href={profileHref} className="flex items-center gap-3 px-5 py-4 hover:bg-brand-50 transition-colors border-b border-slate-100 group">
                <Avatar
                    initials={getSafeInitials(userData?.prenom, userData?.nom)}
                    src={userData?.photo_profile ?? null}
                    size="sm"
                    color="from-brand-400 to-brand-700"
                />
                <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                        {`${getSafeText(userData?.prenom)} ${getSafeText(userData?.nom)}`.trim()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-body truncate">
                        {getSafeText(userData?.filiere)}
                    </p>
                </div>
            </Link>

            <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link key={href} href={href} className={active ? "nav-item-active" : "nav-item"}>
                            <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-brand-600" : "text-slate-400"}`} size={18} />
                            <span className="flex-1 truncate">{label}</span>
                            {href === "/messages" && unreadMessages > 0 && (
                                <span className="badge">{unreadMessages > 99 ? "99+" : unreadMessages}</span>
                            )}
                            {href === "/notifications" && unreadNotifications > 0 && (
                                <span className="badge">{unreadNotifications}</span>
                            )}
                            {href === "/invitations" && invitationCount > 0 && (
                                <span className="badge">{invitationCount}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pb-4 border-t border-slate-100 pt-3">
                <button
                    type="button"
                    onClick={handleLogOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-display font-medium text-sm hover:bg-red-50 transition-all duration-150 w-full text-left"
                >
                    <LogOut size={18} className="shrink-0" />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}