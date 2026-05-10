export function validatePasswordUpdate(
    newPassword: string,
    confirmPassword: string,
    currentPassword?: string
) {
    if (currentPassword !== undefined && !currentPassword.trim()) {
        return "Le mot de passe actuel est obligatoire.";
    }
    if (!newPassword.trim()) return "Le nouveau mot de passe est obligatoire.";
    if (newPassword.length < 8) {
        return "Le nouveau mot de passe doit contenir au moins 8 caractères.";
    }
    if (newPassword !== confirmPassword) {
        return "Les mots de passe ne correspondent pas.";
    }
    return null;
}
