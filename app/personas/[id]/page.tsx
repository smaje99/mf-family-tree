import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyPanel } from "@/components/empty-panel";
import { FamilyCard } from "@/components/family-card";
import { PersonCard } from "@/components/person-card";
import { formatAge, formatLifeSpan, getPersonDetail } from "@/lib/family-tree";

export default async function PersonDetailPage({
  params
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const detail = getPersonDetail(id);

  if (!detail) {
    notFound();
  }

  const lifeSpan = formatLifeSpan(detail.person.birthDate, detail.person.deathDate);
  const age = formatAge(detail.person.birthDate, detail.person.deathDate);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.85fr]">
        <div className="rounded-4xl border border-line bg-paper-strong/90 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
                Perfil de persona
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
                {detail.person.displayName}
              </h1>
              {detail.person.alias ? (
                <p className="mt-3 text-base text-muted">Alias: {detail.person.alias}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Cronología
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">{lifeSpan ?? "Cronología abierta"}</p>
            </article>
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Edad
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">{age ?? "No calculable todavía"}</p>
            </article>
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Género
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">{detail.person.gender ?? "Sin especificar"}</p>
            </article>
            <article className="rounded-[1.4rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Carga de ramas
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {detail.person.familyCount} familias propias y {detail.person.parentFamilyCount} ramas de origen
              </p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/arbol/${detail.person.id}`}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Abrir explorador de ramas
            </Link>
            <Link
              href="/personas"
              className="rounded-full border border-brand/20 bg-white/70 px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand/35 hover:bg-brand-soft"
            >
              Volver al directorio
            </Link>
          </div>
        </div>

        <section className="space-y-4 rounded-4xl border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Eventos registrados
          </p>
          {detail.events.length > 0 ? (
            detail.events.map((event) => (
              <article key={event.id} className="rounded-[1.3rem] border border-line bg-paper-strong/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {event.type}
                </p>
                <p className="mt-2 text-lg text-ink">{event.dateOriginal ?? "Fecha pendiente"}</p>
                {event.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted">{event.description}</p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-muted">
              Esta persona no tiene actualmente eventos estructurados en el archivo importado.
            </p>
          )}
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Rama de origen
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Padres y hermanos</h2>
          </div>
          {detail.parentFamilies.length > 0 ? (
            <>
              <div className="grid gap-4">
                {detail.parentFamilies.map((family) => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>
              {detail.siblings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {detail.siblings.map((sibling) => (
                    <PersonCard key={sibling.id} person={sibling} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyPanel
              title="No hay una rama de origen registrada"
              description="El archivo importado todavía no conecta a esta persona con un nodo familiar de origen."
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Ramas formadas por esta persona
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Parejas e hijos</h2>
          </div>
          {detail.ownFamilies.length > 0 ? (
            <>
              <div className="grid gap-4">
                {detail.ownFamilies.map((family) => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>
              {detail.partners.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {detail.partners.map((partner) => (
                    <PersonCard key={partner.id} person={partner} />
                  ))}
                </div>
              ) : null}
              {detail.children.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {detail.children.map((child) => (
                    <PersonCard key={child.id} person={child} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyPanel
              title="No hay rama descendente registrada"
              description="No existen nodos familiares en el archivo actual donde esta persona figure como madre o padre."
            />
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Notas
          </p>
          <div className="mt-4 space-y-3">
            {detail.notes.length > 0 ? (
              detail.notes.map((note) => (
                <article key={note.id} className="rounded-2xl border border-line bg-paper-strong/75 p-4 text-sm leading-6 text-muted">
                  {note.content}
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">Todavía no hay notas vinculadas a esta persona.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Citas y fuentes
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
              <p className="text-sm leading-6 text-muted">No se vincularon citas durante la importación.</p>
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
              <p className="text-sm leading-6 text-muted">Todavía no hay medios conectados a este perfil.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
