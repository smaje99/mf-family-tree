import Link from "next/link";
import { EmptyPanel } from "@/components/empty-panel";
import { FamilyCard } from "@/components/family-card";
import { PersonCard } from "@/components/person-card";
import { getTreeOverviewData } from "@/lib/family-tree";

export default function TreePage() {
  const overview = getTreeOverviewData();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-4xl border border-line bg-paper-strong/90 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
              Explorador de ramas
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
              Primero los nodos familiares, después las personas.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
              Este explorador se organiza alrededor de ramas familiares para que las relaciones sigan siendo
              legibles incluso cuando falta uno de los padres o cuando varios hijos pertenecen al mismo nodo.
            </p>
          </div>
          {overview.focusPersonId ? (
            <Link
              href={`/arbol/${overview.focusPersonId}`}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Abrir foco sugerido
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Puntos de entrada
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Personas con estructura familiar activa</h2>
          </div>
          {overview.entryPeople.length > 0 ? (
            <div className="grid gap-4">
              {overview.entryPeople.map((person) => (
                <PersonCard key={person.id} person={person} href={`/arbol/${person.id}`} />
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No hay puntos de entrada de ramas"
              description="Cuando el archivo incluya vínculos parentales y filiales, las personas de entrada aparecerán aquí."
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Majé Franco
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Navegación centrada en la casa</h2>
          </div>
          {overview.householdPeople.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {overview.householdPeople.map((person) => (
                <PersonCard key={person.id} person={person} href={`/arbol/${person.id}`} />
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No se detectaron nodos Majé"
              description="Cuando existan registros Majé Franco en el archivo importado, aparecerán destacados aquí."
            />
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Todas las ramas familiares
          </p>
          <h2 className="mt-2 font-display text-4xl text-ink">
            Un mapa legible, a nivel familiar, de la estructura importada
          </h2>
        </div>
        {overview.families.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {overview.families.map((family) => (
              <FamilyCard key={family.id} family={family} />
            ))}
          </div>
        ) : (
          <EmptyPanel
            title="No hay nodos familiares cargados"
            description="Ejecuta la importación y el explorador del árbol listará aquí todas las ramas familiares."
          />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Cola de revisión
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-line bg-paper-strong/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Personas con baja confianza
              </p>
              <p className="mt-2 font-display text-4xl text-ink">{overview.lowConfidencePeople.length}</p>
            </article>
            <article className="rounded-2xl border border-line bg-paper-strong/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Familias con baja confianza
              </p>
              <p className="mt-2 font-display text-4xl text-ink">{overview.lowConfidenceFamilies.length}</p>
            </article>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Personas para revisar
          </p>
          <div className="mt-4 space-y-3">
            {overview.lowConfidencePeople.map((person) => (
              <Link
                key={person.id}
                href={`/personas/${person.id}`}
                className="block rounded-2xl border border-line bg-paper-strong/75 p-4 text-sm text-muted transition hover:border-brand/20 hover:bg-white"
              >
                <span className="font-semibold text-ink">{person.displayName}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-line bg-white/65 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Notas globales
          </p>
          <div className="mt-4 space-y-3">
            {overview.globalNotes.length > 0 ? (
              overview.globalNotes.map((note) => (
                <article key={note.id} className="rounded-2xl border border-line bg-paper-strong/75 p-4 text-sm leading-6 text-muted">
                  {note.content}
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">No hay notas globales de importación disponibles.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
