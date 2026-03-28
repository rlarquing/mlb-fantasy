import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLB Fantasy - Predice Partidos de Béisbol",
  description: "Aplicación de fantasy para predecir partidos de la MLB. Compite con amigos y gana puntos acertando los resultados.",
  keywords: ["MLB", "Fantasy", "Béisbol", "Baseball", "Predicciones", "Deportes"],
  authors: [{ name: "MLB Fantasy Team" }],
  icons: {
    icon: "⚾",
  },
  openGraph: {
    title: "MLB Fantasy",
    description: "Predice partidos de béisbol y gana puntos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
