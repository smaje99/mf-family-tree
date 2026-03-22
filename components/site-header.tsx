import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/arbol", label: "Árbol" },
  { href: "/personas", label: "Personas" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper-strong/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
            MF
          </div>
          <div>
            <p className="font-display text-2xl leading-none text-ink">Casa Majé Franco</p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              Archivo familiar
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-brand-soft hover:text-brand-strong"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
