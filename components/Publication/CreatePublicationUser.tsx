"use client";

import CreatePublicationForm from "./CreatePublicationForm";
import { useCreatePublication } from "@/hooks/usePublication";
import type { PublicationItem, ResponseType } from "@/lib/types";

interface Props {
    publicationToEdit?: PublicationItem;
    categories: ResponseType;
    curUser: ResponseType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreatePublicationUser({ publicationToEdit, categories, curUser, onSuccess, onCancel }: Props) {
    const state = useCreatePublication({ categories, curUser, publicationToEdit, onSuccess, onCancel });
    return <CreatePublicationForm {...state} />;
}