
import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Avatar from "@/components/ui/Avatar";
import ProfileEditor from "../../components/profile/ProfileEditor";
import { getCurrentUser } from "@/services/SessionService";
import { getProfile } from "@/services/ProfileService";
import { createClient } from "@/lib/supabase/server";
import { getSafeInitials, getSafeText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
   
    const curUserResult = await getCurrentUser();
    if (!curUserResult.success) {
        redirect("/auth/login");
    }

    const profileResult = await getProfile();
    if (!profileResult.success) {
        redirect("/auth/login");
    }

    const profile = profileResult.data;
    const userId = curUserResult.data.id_utilisateur;

    const supabase = await createClient();
    const { data: publications } = await supabase
        .from("publication")
        .select("*, media(*)")
        .eq("id_utilisateur", userId)
        .is("id_groupe", null)
        .order("date_publication", { ascending: false });

    const curUser = { success: true, data: curUserResult.data };

    return (
        <AppLayout curUser={curUser}>
            <div className="max-w-3xl mx-auto p-6 space-y-5">

                {/* Profil */}
                <div className="card overflow-hidden">
                    <div className="h-36 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-800 relative">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                            }}
                        />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex items-end -mt-10 mb-5">
                            <Avatar
                                initials={getSafeInitials(profile.prenom, profile.nom)}
                                src={profile.photo_profile ?? null}
                                size="xl"
                                color="from-brand-400 to-brand-700"
                            />
                        </div>

                        <h1 className="font-display font-bold text-2xl text-slate-900">
                            {getSafeText(profile.prenom)} {getSafeText(profile.nom)}
                        </h1>

                        <ProfileEditor profile={profile} />
                    </div>
                </div>

                {/* Publications */}
                <div className="space-y-4">
                    <h2 className="font-display font-semibold text-slate-700 text-sm px-1">
                        Mes publications
                    </h2>

                    {publications && publications.length > 0 ? (
                        publications.map((p: any) => (
                            <div key={p.id_publication} className="card p-5">
                                <p className="text-xs text-slate-400 mb-2">
                                    {new Date(p.date_publication).toLocaleDateString("fr-FR")}
                                </p>
                                <p className="text-sm text-slate-700">{p.contenu}</p>
                                {p.media && p.media.length > 0 && (
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {p.media.map((m: any) => (
                                            <img
                                                key={m.id_media}
                                                src={m.url_media}
                                                alt=""
                                                className="rounded-xl max-h-48 object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="card p-10 text-center">
                            <p className="text-slate-400 text-sm">Aucune publication.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}