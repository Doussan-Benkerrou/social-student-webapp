"use client";

import Link from "next/link";
import { Search, Bell, ChevronDown, Users, User, Hash, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { DISPLAY_FALLBACK, SEARCH_CATEGORIES, ResponseType, DashboardSearchResult, UserSearchResult, GroupSearchResult } from "@/lib/types";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import { useUnreadNotifications } from "@/hooks/useNotification";
import { useDashboardSearch } from "@/hooks/useDashboard";

type Props = { curUser?: ResponseType };

function getResultHref(item: DashboardSearchResult) {
    if (item.type === "user")      return `/profile/${item.id}`;
    if (item.type === "community") return `/communautes/${item.id}`;
    return `/groups/${item.id}`;
}

function getResultLabel(item: DashboardSearchResult): string {
    if (item.type === "user") {
        const u = item as UserSearchResult;
        return `${getSafeText(u.prenom)} ${getSafeText(u.nom)}`.trim();
    }
    return getSafeText((item as GroupSearchResult).nom);
}

function getResultSub(item: DashboardSearchResult): string | null {
    if (item.type === "user") return getSafeText((item as UserSearchResult).filiere, DISPLAY_FALLBACK);
    return `${Number((item as GroupSearchResult).membres_count ?? 0)} membres`;
}

function getResultIcon(item: DashboardSearchResult) {
    if (item.type === "user")      return <User size={13} className="text-brand-600" />;
    if (item.type === "community") return <Hash size={13} className="text-brand-600" />;
    return <Users size={13} className="text-brand-600" />;
}

function getInitials(item: DashboardSearchResult): string {
    if (item.type === "user") {
        const u = item as UserSearchResult;
        return getSafeInitials(u.prenom, u.nom);
    }
    return getSafeInitials((item as GroupSearchResult).nom);
}

export default function TopBar({ curUser }: Props) {
    const userData    = curUser?.data;
    const profileHref = userData?.id_utilisateur ? `/profile/${userData.id_utilisateur}` : "/profile";
    const userInitials = getSafeInitials(userData?.prenom, userData?.nom);
    const userName     = `${getSafeText(userData?.prenom)} ${getSafeText(userData?.nom)}`.trim();
    const userLevel    = getSafeText(userData?.niveau_etude, "Niveau non renseigné");

    const { unreadNotifications } = useUnreadNotifications(userData?.id_utilisateur);

    const {
        searchCategory, searchQuery, setSearchQuery,
        searchResults, isSearching,
        searchOpen, setSearchOpen,
        dropOpen, setDropOpen,
        showDropdown, changeCategory,
    } = useDashboardSearch();

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 z-20 shadow-sm">
            <div className="flex-1 flex items-center gap-2 max-w-xl">
                <div className="relative">
                    <button
                        onClick={() => setDropOpen(!dropOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-sm font-display font-semibold hover:bg-brand-100 transition-colors"
                    >
                        {searchCategory}
                        <ChevronDown size={14} className={`transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-xl shadow-card-hover border border-slate-100 py-1 z-50 animate-fade-in">
                            {SEARCH_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => changeCategory(cat)}
                                    className={`w-full text-left px-4 py-2 text-sm font-body transition-colors ${
                                        cat === searchCategory
                                            ? "text-brand-700 font-semibold bg-brand-50"
                                            : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex-1">
                    {isSearching ? (
                        <Loader2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 animate-spin pointer-events-none" />
                    ) : (
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    )}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Rechercher un${searchCategory === "Personne" ? "e personne" : ` ${searchCategory.toLowerCase()}`}…`}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 800)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 focus:bg-white transition-all"
                    />

                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-card-hover border border-slate-100 py-2 z-50 animate-fade-in">
                            <p className="px-4 py-1.5 text-[11px] font-display font-semibold text-slate-400 uppercase tracking-wider">
                                Résultats
                            </p>
                            {searchResults.length === 0 && !isSearching ? (
                                <p className="px-4 py-2.5 text-sm text-slate-400 font-body">Aucun résultat trouvé.</p>
                            ) : (
                                searchResults.map((item) => (
                                    <Link
                                        key={`${item.type}-${item.id}`}
                                        href={getResultHref(item)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {getInitials(item)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{getResultLabel(item)}</p>
                                            {getResultSub(item) && (
                                                <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                                                    {getResultIcon(item)} {getResultSub(item)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1" />

            <Link href="/notifications" className="btn-icon relative">
                <Bell size={18} />
                {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-display font-bold flex items-center justify-center">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                )}
            </Link>

            <Link href={profileHref} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <Avatar initials={userInitials} size="sm" color="from-brand-400 to-brand-700" src={userData?.photo_profile ?? null} />
                <div className="hidden md:block">
                    <p className="font-display font-semibold text-sm text-slate-800 leading-none">
                        {userName || DISPLAY_FALLBACK}
                    </p>
                    <p className="text-[11px] text-slate-400 font-body">{userLevel}</p>
                </div>
            </Link>
        </header>
    );
}