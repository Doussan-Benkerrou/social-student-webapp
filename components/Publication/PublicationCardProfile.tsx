"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, UserCircle2 } from "lucide-react";
import Avatar from "@/components/ui/AvatarProfile";
import { createClient } from "@/lib/supabase/client";

interface Props {
    id: number;
    prenom?: string;
    nom?: string;
    contenu: string;
    datePublication: string;
    likes: number;
    isAnonymous: boolean;
    currentUserId?: number;
}

export default function PublicationCard({
    id,
    prenom,
    nom,
    contenu,
    datePublication,
    likes: initialLikes,
    isAnonymous,
    currentUserId,
}: Props) {
    const supabase = createClient();

    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(initialLikes);

    const handleLike = async () => {
        if (!currentUserId) return;

        if (!liked) {
            await supabase.from("favoris").insert({
                id_utilisateur: currentUserId,
                id_publication: id,
            });
            setLiked(true);
            setLikes((l) => l + 1);
        } else {
            await supabase
                .from("favoris")
                .delete()
                .eq("id_utilisateur", currentUserId)
                .eq("id_publication", id);

            setLiked(false);
            setLikes((l) => l - 1);
        }
    };

    return (
        <article className="card p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
                {isAnonymous ? (
                    <UserCircle2 className="text-slate-400" />
                ) : (
                    <Link href="#">
                        <Avatar
                            initials={`${prenom?.[0] || ""}${nom?.[0] || ""}`}
                            size="md"
                            color="from-sky-400 to-blue-600"
                        />
                    </Link>
                )}

                <div>
                    <p className="font-semibold text-sm">
                        {isAnonymous ? "Anonyme" : `${prenom} ${nom}`}
                    </p>
                    <p className="text-xs text-slate-400">{datePublication}</p>
                </div>
            </div>

            <p className="text-sm text-slate-700 mb-4">{contenu}</p>

            <button onClick={handleLike} className="flex items-center gap-1 text-sm">
                <Heart size={16} /> {likes}
            </button>
        </article>
    );
}