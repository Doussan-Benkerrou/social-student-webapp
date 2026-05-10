"use client";

import CreatePublicationForm from "./CreatePublicationForm";
import { useCreatePublication } from "@/hooks/usePublication";
import type { PublicationItem, ResponseType } from "@/lib/types";

interface Props {
    groupId: number;
    publicationToEdit?: PublicationItem;
    categories: ResponseType;
    curUser: ResponseType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreatePublication({ groupId, publicationToEdit, categories, curUser, onSuccess, onCancel }: Props) {
    const state = useCreatePublication({ categories, curUser, publicationToEdit, groupId, onSuccess, onCancel });
    return <CreatePublicationForm {...state} />;
}