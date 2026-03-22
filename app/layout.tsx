import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Majé Franco",
  description: "Archivo familiar vivo para la casa Majé Franco."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
