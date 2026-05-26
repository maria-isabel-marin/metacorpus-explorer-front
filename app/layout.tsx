import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Raleway } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MetaCorpus Explorer",
  description:
    "Plataforma multi-corpus para la exploración, búsqueda y visualización de metáforas conceptuales anotadas con MIPVU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${raleway.variable}`}>{children}</body>
    </html>
  );
}
