import { EmptyPanel } from "@/components/empty-panel";
import { PersonCard } from "@/components/person-card";
import { getPeopleDirectory } from "@/lib/family-tree";

export default function PeoplePage() {
  const people = getPeopleDirectory();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-4xl border border-line bg-paper-strong/85 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
          Directorio de personas
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
          Navega por cada persona registrada en el archivo.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          Cada tarjeta muestra cronología, participación en ramas, hijos vinculados
          en el grafo actual y densidad de notas. Este es el mejor punto de partida
          para revisión y curaduría manual.
        </p>
      </section>

      {people.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </section>
      ) : (
        <EmptyPanel
          title="No hay personas cargadas"
          description="Primero debes poblar el archivo SQLite y aquí aparecerá el directorio completo de personas."
        />
      )}
    </main>
  );
}
