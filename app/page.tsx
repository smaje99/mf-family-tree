import Link from "next/link";
import { EmptyPanel } from "@/components/empty-panel";
import { FamilyCard } from "@/components/family-card";
import { PersonCard } from "@/components/person-card";
import { getHomePageData } from "@/lib/family-tree";

export default function HomePage() {
  const snapshot = getHomePageData();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-4xl border border-line bg-paper-strong/85 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
            Casa Majé Franco
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
            Un archivo familiar vivo, no solo una lista de nombres.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            Esta capa ya lee directamente el archivo SQLite y abre una navegación real
            por personas, nodos familiares, notas, niveles de confianza y detalle de ramas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={snapshot.focusPersonId ? `/arbol/${snapshot.focusPersonId}` : "/arbol"}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Abrir explorador de ramas
            </Link>
            <Link
              href="/personas"
              className="rounded-full border border-brand/20 bg-white/70 px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand/35 hover:bg-brand-soft"
            >
              Explorar personas
            </Link>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[
            ["Personas", snapshot.counts.persons],
            ["Familias", snapshot.counts.families],
            ["Medios", snapshot.counts.media],
            ["Historias", snapshot.counts.stories]
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-[1.7rem] border border-line bg-white/70 p-5 shadow-[0_18px_36px_rgb(76_47_24/0.05)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {label}
              </p>
              <p className="mt-3 font-display text-5xl leading-none text-ink">{value}</p>
            </article>
          ))}
        </section>
      </section>

      <section className="rounded-[1.8rem] border border-brand/12 bg-brand-soft/55 px-6 py-5 text-sm leading-6 text-brand-strong">
        {snapshot.isReady ? snapshot.statusMessage : "Ejecuta pnpm db:setup y pnpm import:tree para poblar el archivo."}
      </section>

      {snapshot.householdPeople.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                Núcleo Majé Franco
              </p>
              <h2 className="mt-2 font-display text-4xl text-ink">
                Los puntos de entrada actuales de la casa
              </h2>
            </div>
            <Link href="/arbol" className="text-sm font-semibold text-brand-strong hover:text-brand">
              Ver todas las ramas
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.householdPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Personas con mayor actividad de ramas
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Navega desde las personas hacia la estructura</h2>
          </div>
          <div className="grid gap-4">
            {snapshot.featurePeople.length > 0 ? (
              snapshot.featurePeople.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))
            ) : (
              <EmptyPanel
                title="Todavía no hay personas cargadas"
                description="El directorio aparecerá aquí en cuanto el archivo SQLite importado esté disponible."
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Nodos familiares
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">
              Las conexiones se organizan alrededor de ramas familiares
            </h2>
          </div>
          <div className="grid gap-4">
            {snapshot.featureFamilies.length > 0 ? (
              snapshot.featureFamilies.map((family) => (
                <FamilyCard key={family.id} family={family} />
              ))
            ) : (
              <EmptyPanel
                title="Todavía no hay ramas familiares"
                description="Cuando el conjunto de datos esté presente, cada nodo familiar aparecerá aquí con padres, hijos, lugar y confianza."
              />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[1.8rem] border border-line bg-white/60 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Capa funcional entregada
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <li>Directorio de personas con conteos de ramas, notas y cronología.</li>
            <li>Fichas de persona con ramas de origen, hermanos, parejas, hijos, notas y citas.</li>
            <li>Fichas de familia con nodos parentales y vínculos a descendencia.</li>
            <li>Puntos de entrada al explorador centrados en personas reales del conjunto de datos.</li>
          </ul>
        </div>

        <div className="rounded-[1.8rem] border border-line bg-paper-strong/75 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Notas de origen arrastradas desde la importación
          </p>
          <div className="mt-4 space-y-3">
            {snapshot.globalNotes.length > 0 ? (
              snapshot.globalNotes.map((note) => (
                <article key={note.id} className="rounded-2xl border border-line bg-white/70 p-4 text-sm leading-6 text-muted">
                  {note.content}
                </article>
              ))
            ) : (
              <p className="text-sm text-muted">Las notas globales aparecerán aquí a medida que el archivo crezca.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
