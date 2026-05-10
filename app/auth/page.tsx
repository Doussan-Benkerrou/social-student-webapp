"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";


export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<any>(null);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        const supabase = createClient();
        setLoading(true);
        setError(null);
        await supabase.auth.signOut();
        setSession(null);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setSession(data.session);
        }
    }

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setSession(null);
        setEmail("");
        setPassword("");
    }

    if (session) {
        return (
            <main style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.iconWrap}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#22c55e" strokeWidth="1.8" />
                            <path
                                d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
                                stroke="#22c55e"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <h2 style={styles.title}>Connecté</h2>
                    <p style={styles.sub}>{session.user.email}</p>

                    <details style={styles.details}>
                        <summary style={styles.summary}>Voir le token d'accès</summary>
                        <code style={styles.token}>{session.access_token}</code>
                    </details>

                    <button onClick={handleSignOut} style={{ ...styles.btn, ...styles.btnDanger }}>
                        Se déconnecter
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={styles.page}>
            <div style={styles.card}>
                <div style={styles.iconWrap}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6366f1" strokeWidth="1.8" />
                        <path
                            d="M7 11V7a5 5 0 0 1 10 0v4"
                            stroke="#6366f1"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <h1 style={styles.title}>Connexion</h1>
                <p style={styles.sub}>Accédez à votre espace</p>

                <form onSubmit={handleSignIn} style={styles.form}>
                    <label style={styles.label}>
                        E-mail
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@exemple.com"
                            required
                            style={styles.input}
                        />
                    </label>

                    <label style={styles.label}>
                        Mot de passe
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={styles.input}
                        />
                    </label>

                    {error && <p style={styles.error}>⚠ {error}</p>}

                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>
                </form>
            </div>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f13",
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        padding: "1rem",
    },
    card: {
        background: "#18181f",
        border: "1px solid #2a2a35",
        borderRadius: "1rem",
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
    },
    iconWrap: {
        background: "#1e1e2e",
        border: "1px solid #2a2a35",
        borderRadius: "50%",
        width: "64px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "0.5rem",
    },
    title: {
        color: "#f1f1f1",
        fontSize: "1.4rem",
        fontWeight: 600,
        margin: 0,
        letterSpacing: "-0.02em",
    },
    sub: {
        color: "#6b7280",
        fontSize: "0.875rem",
        margin: "0 0 1rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        marginTop: "0.5rem",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        color: "#9ca3af",
        fontSize: "0.8rem",
        fontWeight: 500,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
    },
    input: {
        background: "#0f0f13",
        border: "1px solid #2a2a35",
        borderRadius: "0.5rem",
        color: "#f1f1f1",
        fontSize: "0.95rem",
        padding: "0.65rem 0.9rem",
        outline: "none",
        transition: "border-color 0.15s",
    },
    btn: {
        marginTop: "0.5rem",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: "0.5rem",
        padding: "0.75rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
        transition: "opacity 0.15s",
    },
    btnDanger: {
        background: "#ef4444",
        marginTop: "1.5rem",
        width: "auto",
        padding: "0.6rem 1.5rem",
    },
    error: {
        color: "#f87171",
        fontSize: "0.85rem",
        background: "#2a1515",
        border: "1px solid #7f1d1d",
        borderRadius: "0.4rem",
        padding: "0.5rem 0.75rem",
        margin: 0,
    },
    details: {
        width: "100%",
        marginTop: "0.5rem",
    },
    summary: {
        color: "#6366f1",
        cursor: "pointer",
        fontSize: "0.85rem",
        userSelect: "none",
    },
    token: {
        display: "block",
        marginTop: "0.5rem",
        background: "#0f0f13",
        border: "1px solid #2a2a35",
        borderRadius: "0.4rem",
        color: "#9ca3af",
        fontSize: "0.7rem",
        padding: "0.5rem",
        wordBreak: "break-all",
        maxHeight: "80px",
        overflowY: "auto",
    },
};