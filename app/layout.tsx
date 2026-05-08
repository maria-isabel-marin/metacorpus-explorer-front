import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
