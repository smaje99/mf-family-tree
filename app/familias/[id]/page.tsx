import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidencePill } from "@/components/confidence-pill";
import { EmptyPanel } from "@/components/empty-panel";
import { PersonCard } from "@/components/person-card";
import { familyLabel, getFamilyDetail } from "@/lib/family-tree";

export default async function FamilyDetailPage({
  params
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const detail = getFamilyDetail(id);

  if (!detail) {
    notFound();
  }

  let branchNotesContent: React.ReactNode;

  if (detail.notes.length > 0) {
    branchNotesContent = detail.notes.map((note) => (
      <article
        key={note.id}
        className="rounded-2xl border border-line bg-paper-strong/75 p-4 text-sm leading-6 text-muted"
      >
        {note.content}
      </article>
    ));
  } else if (detail.family.notesMarkdown) {
    branchNotesContent = (
      <article className="rounded-2xl border border-line bg-paper-strong/75 p-4 text-sm leading-6 text-muted">
        {detail.family.notesMarkdown}
      </article>
    );
  } else {
    branchNotesContent = (
      <p className="text-sm leading-6 text-muted">Todavía no hay notas de rama vinculadas.</p>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.9fr]">
        <div className="rounded-4xl border border-line bg-paper-strong/90 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
                Nodo familiar
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
                {familyLabel(detail.family)}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                Esta página agrupa el tipo de relación, el lugar, las notas, las citas y
                toda la descendencia vinculada en una sola rama familiar legible.
              </p>
            </div>
            <ConfidencePill confidence={detail.family.confidence} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Tipo
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {detail.family.relationshipType ?? "Clasificación pendiente"}
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Lugar
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {detail.family.placeName ?? "Sin lugar asociado"}
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Hijos
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {detail.family.children.length} nodos filiales vinculados
              </p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/arbol"
              className="rounded-full border border-brand/20 bg-white/70 px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand/35 hover:bg-brand-soft"
            >
              Volver a las ramas
            </Link>
          </div>
        </div>

        <section className="space-y-4 rounded-4xl border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Notas de la rama
          </p>
          {branchNotesContent}
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Padres
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Anclas de relación</h2>
          </div>
          {detail.parents.length > 0 ? (
            <div className="grid gap-4">
              {detail.parents.map((parent) => (
                <PersonCard key={parent.id} person={parent} />
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="Los padres están incompletos"
              description="Este nodo familiar tiene actualmente uno o ambos padres sin resolver en el árbol importado."
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Hijos
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Descendencia de la rama</h2>
          </div>
          {detail.family.children.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {detail.family.children.map((child) => (
                <PersonCard key={child.id} person={child} />
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No hay hijos vinculados"
              description="La familia existe en el grafo, pero todavía no tiene nodos filiales asociados."
            />
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Citas
          </p>
          <div className="mt-4 space-y-3">
            {detail.citations.length > 0 ? (
              detail.citations.map((citation) => (
                <article key={citation.id} className="rounded-2xl border border-line bg-paper-strong/75 p-4">
                  <p className="text-sm font-semibold text-ink">
                    {citation.sourceTitle ?? citation.sourceAbbreviation ?? citation.id}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Página: {citation.page ?? "sin paginación"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">Todavía no hay citas vinculadas para esta rama.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Medios
          </p>
          <div className="mt-4 space-y-3">
            {detail.media.length > 0 ? (
              detail.media.map((media) => (
                <article key={media.id} className="rounded-2xl border border-line bg-paper-strong/75 p-4">
                  <p className="text-sm font-semibold text-ink">{media.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {media.filePath ?? "Medio vinculado sin ruta local todavía"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">Todavía no hay medios asociados a esta rama.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
