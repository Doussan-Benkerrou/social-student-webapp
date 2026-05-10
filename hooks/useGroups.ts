"use client"


import { createClient } from "@/lib/supabase/client"

import { useRouter } from "next/navigation";
import { getGroupsDetails , getActiveGroups } from "@/services/GroupsService";
import { joinGroupAsMember, leaveGroup, removeMemberFromGroup, getGroupMembers, getUserStatusInGroup } from "@/services/memberService";
import { normalizeDetail, normalizeMember , normalizeGroup } from "@/lib/utils";
import type { GroupeUI, MemberItem, ResponseType, UserStatus } from "@/lib/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "./UseToast";



export function useGroupsRealtime(
    onUpdate: () => void | Promise<void>,
    userId?: number
) {
    const [groupIds, setGroupIds] = useState<number[]>([]);
 
    useEffect(() => {
        if (!userId) return;
        const supabase = createClient();
        supabase
            .from("membre")
            .select("id_groupe")
            .eq("id_utilisateur", userId)
            .is("date_quitte", null)
            .then(({ data }) => {
                const ids = (data ?? []).map((m: any) => m.id_groupe);
                console.log("🔄 Groupes de l'utilisateur:", ids);
                setGroupIds(ids);
            });
    }, [userId]);
 
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase.channel(`realtime-groups-${userId ?? "anon"}`);
 
        if (groupIds.length > 0) {
            const filter = `id_groupe=in.(${groupIds.join(",")})`;
 
            channel
                .on("postgres_changes", { event: "*",      schema: "public", table: "membre",     filter }, async () => onUpdate())
                .on("postgres_changes", { event: "*",      schema: "public", table: "groupe",     filter }, async () => onUpdate())
                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invitation", filter }, async () => onUpdate());
        } else {

            channel
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "membre" }, async () => onUpdate())
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "groupe" }, async () => onUpdate());
        }
 
        channel.subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [onUpdate, groupIds, userId]);
}




export function useMyGroups(initialMyGroupsResult: ResponseType, userId?: number) {
    const { toasts, showToast, hideToast } = useToast();
 
    const [myGroups, setMyGroups] = useState<GroupeUI[]>(() =>
        Array.isArray(initialMyGroupsResult.data)
            ? initialMyGroupsResult.data.map(normalizeGroup)
            : []
    );
    const [refreshing, setRefreshing] = useState(false);
 
    const isInitialError = !initialMyGroupsResult.success && myGroups.length === 0;
 
    useEffect(() => {
        if (isInitialError) {
            showToast(initialMyGroupsResult.message ?? "Impossible de charger vos groupes.", "error");
        }
    }, [isInitialError, initialMyGroupsResult.message, showToast]);
 
    const reloadGroups = useCallback(async () => {
        setRefreshing(true);
        const result = await getActiveGroups();
        setRefreshing(false);
        if (!result.success) {
            showToast(result.message ?? "Impossible de charger vos groupes.", "error");
            setMyGroups([]);
            return;
        }
        setMyGroups((result.data ?? []).map(normalizeGroup));
    }, [showToast]);
 
    useGroupsRealtime(reloadGroups, userId);
 
    const emptyMessage = useMemo(
        () => isInitialError ? "Aucun groupe." : "Vous n'avez rejoint aucun groupe pour le moment.",
        [isInitialError]
    );
 
    return { myGroups, refreshing, emptyMessage, toasts, showToast, hideToast };
}


export function useGroupDetail(
    idGroup: number,
    curUser: ResponseType,
    groupResult: ResponseType,
    membersResult: ResponseType,
    userStatusResult: ResponseType
) {
    const router = useRouter();
    const { toasts, showToast, hideToast } = useToast();

    const initialMembers = useMemo<MemberItem[]>(
        () => Array.isArray(membersResult.data) ? membersResult.data.map(normalizeMember) : [],
        [membersResult.data]
    );

    const initialGroup = useMemo<GroupeUI | null>(() => {
        if (!groupResult.success || !groupResult.data) return null;
        return normalizeDetail(groupResult.data, initialMembers.length);
    }, [groupResult.success, groupResult.data, initialMembers.length]);

    const [group, setGroup]         = useState<GroupeUI | null>(initialGroup);
    const [members, setMembers]     = useState<MemberItem[]>(initialMembers);
    const [userStatus, setUserStatus] = useState<UserStatus>(
        userStatusResult.success ? userStatusResult.data : "none"
    );

    useEffect(() => {
        if (!groupResult.success && !group)
            showToast(groupResult.message ?? "Impossible de charger le groupe.", "error");
        if (!membersResult.success && initialMembers.length === 0)
            showToast(membersResult.message ?? "Impossible de charger les membres.", "error");
        if (!userStatusResult.success)
            showToast(userStatusResult.message ?? "Impossible de charger votre statut.", "error");
    }, [groupResult, membersResult, userStatusResult, group, initialMembers.length, showToast]);

    const loadAll = useCallback(async () => {
        const [detailsResult, nextMembersResult, statusResult] = await Promise.all([
            getGroupsDetails(idGroup),
            getGroupMembers(idGroup),
            getUserStatusInGroup(idGroup),
        ]);

        if (!detailsResult.success) {
            showToast(detailsResult.message ?? "Impossible de charger le groupe.", "error");
            setGroup(null);
            return;
        }

        const normalizedMembers = Array.isArray(nextMembersResult.data)
            ? nextMembersResult.data.map(normalizeMember)
            : [];

        setGroup(normalizeDetail(detailsResult.data, normalizedMembers.length));
        setMembers(normalizedMembers);
        setUserStatus(statusResult.success ? statusResult.data : "none");

        if (!nextMembersResult.success)
            showToast(nextMembersResult.message ?? "Impossible de charger les membres.", "error");
    }, [idGroup, showToast]);

    useGroupsRealtime(loadAll, curUser.data?.id_utilisateur);

    const handleJoin = async () => {
        const r = await joinGroupAsMember(idGroup, curUser.data?.id_utilisateur);
        if (!r.success) { showToast(r.message ?? "Erreur.", "error"); return; }
        setUserStatus("pending");
        showToast("Demande envoyée !", "success");
    };

    const handleLeave = async () => {
        const r = await leaveGroup(idGroup);
        if (!r.success) { showToast(r.message ?? "Erreur.", "error"); return; }
        setUserStatus("none");
        showToast("Vous avez quitté le groupe.", "success");
        router.push("/groups");
    };

    const handleRemoveMember = async (idUser: number) => {
        const r = await removeMemberFromGroup(idGroup, idUser);
        if (!r.success) { showToast(r.message ?? "Erreur.", "error"); return; }
        setMembers((prev) => prev.filter((m) => m.id_utilisateur !== idUser));
        setGroup((prev) => prev ? { ...prev, membres: Math.max(0, prev.membres - 1) } : prev);
        showToast("Membre retiré du groupe.", "success");
    };

    return {
        group, members, userStatus,
        handleJoin, handleLeave, handleRemoveMember,
        loadAll,
        toasts, showToast, hideToast,
    };
}