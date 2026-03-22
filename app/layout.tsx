import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
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
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-136 bg-[radial-gradient(circle_at_top,rgb(127_79_40/0.12),transparent_58%)]" />
          <SiteHeader />
          {children}
          <footer className="border-t border-line/70 bg-paper-strong/70">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted sm:px-6 lg:px-8">
              Archivo local-first para la casa Majé Franco.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
