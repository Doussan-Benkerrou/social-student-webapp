
import AppLayout from "@/components/layout/AppLayout"
import BlockedUsersList from "@/components/block/BlockedUsersList"
import { getProfile } from "@/services/ProfileService"
import { Shield } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function BlockedUsersPage() {
    const curUser = await getProfile();

    return (
        <AppLayout curUser={curUser}>
            <div className="max-w-2xl mx-auto p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <Shield size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-900">
                            Liste de blocage
                        </h1>
                        <p className="text-sm text-slate-500 font-body mt-0.5">
                            Gérez les utilisateurs que vous avez bloqués
                        </p>
                    </div>
                </div>

                <div className="card p-6">
                    <BlockedUsersList />
                </div>
            </div>
        </AppLayout>
    );
}