"use client";

import { createContext, useContext } from "react";

export type Utilisateur = {
    id_utilisateur: number;
    auth_id: string | null;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    email_univer: string;
    numero_tel: string;
    adresse: string;
    sexe?: string;
    photo_profile?: string;
    bio?: string;
    filiere?: string;
    niveau_etude?: string;
    date_creation: string;
};

export type UserContextValue = {
    user: Utilisateur | null;
    loading: boolean;
    refresh: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue>({
    user: null,
    loading: true,
    refresh: async () => {},
});


export default function useUser() {
    return useContext(UserContext);
}