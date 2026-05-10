export type ResponseType<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
};


export const DISPLAY_FALLBACK = "??";


export type ToastType = "success" | "error" | "info";

export type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
};

export enum GroupeType {
    PUBLIC = "publication",
    DISCUSSION = "discussion",
}

export type GroupeInput = {
    nameGroup: string;
    description: string;
};

export type pubInput = {
    contenu?: string;
    isAnonyme?: boolean;
    categorieType: string;
    groupId: number;
    pictures?: File[] | null;
};

export type GroupeUI = {
    id: number;
    nom: string;
    description: string;
    type: string;
    photo: string | null;
    color: string;
    initials: string;
    membres: number;
    role?: string;
};

export const GROUP_COLORS = [
    "from-violet-500 to-purple-700",
    "from-blue-500 to-indigo-700",
    "from-emerald-500 to-teal-700",
    "from-rose-500 to-pink-700",
    "from-amber-500 to-orange-700",
];

export type Tab = "my" | "suggestions";

export type CreateGroupModalProps = {
    showCreate: boolean;
    setShowCreate: React.Dispatch<React.SetStateAction<boolean>>;
};

export type UserItem = {
    nom: string;
    prenom: string;
    filiere: string;
    id_utilisateur: number;
};



export type MemberItem = {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    filiere: string;
    annee_etude?: string;
    photo_profile: string | null;
    role: string;
};

export type UserStatus = "admin" | "membre" | "pending" | "none";

export interface MyGroupsTabProps {
    onCountChange?: (count: number) => void;
}

export type MediaItem = {
    id_media: number;
    url_media: string;
    type_media: "image" | "video";
};

export type AutorItem = {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    photo_profile: string | null;
    filiere?: string;
    niveau_etude?: string;
};

export type CategorieItem = {
    id_categorie: number;
    nom_categorie: string;
};

export type GroupeBasicItem = {
    id_groupe: number;
    nom_groupe: string;
    photo_groupe: string | null;
};

export type SignaleItem = {
    motif_signale: string;
};

export type PublicationItem = {
    id_publication: number;
    contenu: string;
    date_publication: string;
    est_anonyme: boolean;
    categorie: CategorieItem;
    groupe: GroupeBasicItem;
    nombre_reactions: number;
    nombre_commentaires: number;
    a_reagir: boolean;
    auteur: AutorItem;
    a_favoris: boolean;
    medias?: MediaItem[];
    signalisations?: SignaleItem | null;
};

export type CommentaireItem = {
    id_commentaire: number;
    contenu_com: string;
    date_com: string;
    id_commentaire_parent: number | null;
    auteur: AutorItem;
    reponses?: CommentaireItem[];
};

export type pubUserInput = {
    contenu?: string;
    isAnonyme?: boolean;
    categorieType: string;
    pictures?: File[] | null;
};




export const SEARCH_CATEGORIES: SearchCategory[] = ["Personne", "Groupe", "Communauté"];

export type SearchCategory = "Personne" | "Groupe" | "Communauté";

export type UserSearchResult = {
    type: "user";
    id: number;
    nom: string;
    prenom: string;
    filiere: string | null;
    photo_profile: string | null;
};

export type GroupSearchResult = {
    type: "group" | "community";
    id: number;
    nom: string;
    description: string | null;
    photo: string | null;
    membres_count: number;
};

export type DashboardSearchResult = UserSearchResult | GroupSearchResult;



export type RegisterInput = {
    nom: string
    prenom: string
    date_naissance: string
    sexe: string
    email_univer: string
    numero_tel: string
    adresse: string
    password: string
    confirm_mot_de_passe: string
}

export type ResetPasswordInput = {
    new_password: string
    confirm_mot_de_passe: string
}


export type LoginInput = {
    email: string
    password: string
}

export interface UserProfile {
    id_utilisateur: number;
    auth_id: string | null;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    email_univer: string;
    numero_tel: string;
    adresse: string;
    sexe: string | null;
    photo_profile: string | null;
    bio: string | null;
    filiere: string | null;
    niveau_etude: string | null;
}

export interface UserProfileUpdate {
    nom: string;
    prenom: string;
    email_univer: string;
    numero_tel: string;
    adresse: string;
    bio?: string | null;
    filiere?: string | null;
    niveau_etude?: string | null;
}

export interface AppNotification {
    id_notif: number;
    type_notif: string;
    contenu_notif: string;
    date_notif: string;
    etat_notif: boolean;
    id_utilisateur: number;
    id_publication: number | null;
    id_commentaire: number | null;
    id_reaction: number | null;
    id_message: number | null;
    id_invitation: number | null;
}

export type AssistantMode = "chat" | "image";

export interface AssistantMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

export interface GeminiAssistantConfig {
    chatModel: string;
    imageModel: string;
}

export interface GeminiImageResult {
    imageDataUrl: string | null;
    text: string;
    mimeType: string | null;
}

export interface AssistantChatActionResult {
    success: boolean;
    message?: AssistantMessage;
    error?: string;
}

export interface AssistantImageActionResult {
    success: boolean;
    image?: GeminiImageResult;
    error?: string;
}


export type Groupe = {
  id_groupe: number;
  nom_groupe: string;
  photo_groupe: string | null;
  description: string | null;
  date_creation: string;
  type_grp: "publication" | "discussion";
  id_createur: number | null;
};

export type Membre = {
  id_groupe: number;
  id_utilisateur: number;
  date_adhesion: string;
  role: "admin" | "membre";
  date_quitte: string | null;
};

export type GroupeWithMeta = Groupe & {
  nombreMembres: number;
  isMember: boolean;
  isAdmin: boolean;
  pendingRequest?: boolean;
};



export type UtilisateurBref = {
  id_utilisateur: number
  nom: string
  prenom: string
  photo_profile: any
}

export type GroupeBref = {
  id_groupe: number
  nom_groupe: string
  photo_groupe: any
}

export type Sender = {
  id_utilisateur: number
  nom: string
  prenom: string
  photo_profile: string | null
}

export type Message = {
  id_message    : number
  content       : string
  date_message : string | Date
  is_read       : boolean
  id_sender     : number
  id_discussion : number
  senderInfo?   : Sender | null
}


export type Discussion = {
  id_discussion: number
  date_creation: string
  id_user1: number | null
  id_user2: number | null
  id_groupe: number | null
  messages: Message[]
  user1?: UtilisateurBref | null
  user2?: UtilisateurBref | null
  groupe?: GroupeBref | null
}