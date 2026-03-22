import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-6 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
        No encontrado
      </p>
      <h1 className="font-display text-5xl leading-[0.95] text-ink">
        Esta rama o persona no está presente en el archivo actual.
      </h1>
      <p className="max-w-2xl text-base leading-7 text-muted">
        La ruta puede apuntar a un id que todavía no ha sido importado, o el conjunto
        de datos aún puede estar incompleto.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/arbol"
          className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Abrir vista general del árbol
        </Link>
        <Link
          href="/personas"
          className="rounded-full border border-brand/20 bg-white/70 px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand/35 hover:bg-brand-soft"
        >
          Explorar personas
        </Link>
      </div>
    </main>
  );
}
