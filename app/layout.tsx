import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/hooks/UserProvider";


export const metadata: Metadata = {
  title: "uniYo – Réseau Social Étudiant",
  description: "La plateforme sociale dédiée aux étudiants",
  icons: {
    icon: "/icons/logo_uniyo.ico", // Placez le fichier dans le dossier public/
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}