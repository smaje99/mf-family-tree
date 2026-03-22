import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyPanel } from "@/components/empty-panel";
import { FamilyCard } from "@/components/family-card";
import { PersonCard } from "@/components/person-card";
import { formatAge, formatLifeSpan, getPersonDetail } from "@/lib/family-tree";

export default async function FocusedTreePage({
  params
}: Readonly<{
  params: Promise<{ personId: string }>;
}>) {
  const { personId } = await params;
  const detail = getPersonDetail(personId);

  if (!detail) {
    notFound();
  }

  const age = formatAge(detail.person.birthDate, detail.person.deathDate);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-4xl border border-line bg-paper-strong/90 p-8 shadow-[0_26px_60px_rgb(76_47_24/0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
              Explorador de ramas enfocado
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
              {detail.person.displayName}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
              Lee esta rama de izquierda a derecha: familia de origen, persona enfocada
              y luego las familias y descendientes construidos alrededor de ella.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Link
              href={`/personas/${detail.person.id}`}
              className="text-sm font-semibold text-brand-strong hover:text-brand"
            >
              Abrir perfil completo
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Antes
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Rama de origen y hermanos</h2>
          </div>
          {detail.parentFamilies.length > 0 ? (
            <>
              <div className="grid gap-4">
                {detail.parentFamilies.map((family) => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>
              {detail.siblings.length > 0 ? (
                <div className="grid gap-4">
                  {detail.siblings.map((sibling) => (
                    <PersonCard key={sibling.id} person={sibling} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyPanel
              title="Rama de origen sin resolver"
              description="No hay una familia parental conectada a esta persona en la importación actual."
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Foco
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Nodo actual de persona</h2>
          </div>
          <article className="rounded-4xl border border-brand/18 bg-brand-soft/65 p-6 shadow-[0_22px_46px_rgb(76_47_24/0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                  {detail.person.id}
                </p>
                <h3 className="mt-3 font-display text-4xl text-ink">
                  {detail.person.displayName}
                </h3>
                {detail.person.alias ? (
                  <p className="mt-2 text-sm text-muted">Alias: {detail.person.alias}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.4rem] border border-brand/10 bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Cronología
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  {formatLifeSpan(detail.person.birthDate, detail.person.deathDate) ?? "Cronología abierta"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-brand/10 bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Edad
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">{age ?? "No calculable todavía"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-brand/10 bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Carga descendente
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  {detail.children.length} vínculos filiales en {detail.ownFamilies.length} nodos familiares.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Después
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink">Familias, parejas y descendientes</h2>
          </div>
          {detail.ownFamilies.length > 0 ? (
            <>
              <div className="grid gap-4">
                {detail.ownFamilies.map((family) => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>
              {detail.partners.length > 0 ? (
                <div className="grid gap-4">
                  {detail.partners.map((partner) => (
                    <PersonCard key={partner.id} person={partner} />
                  ))}
                </div>
              ) : null}
              {detail.children.length > 0 ? (
                <div className="grid gap-4">
                  {detail.children.map((child) => (
                    <PersonCard key={child.id} person={child} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyPanel
              title="No hay rama descendente vinculada"
              description="Esta persona enfocada no figura actualmente como madre o padre en ningún nodo familiar registrado."
            />
          )}
        </div>
      </section>
    </main>
  );
}
