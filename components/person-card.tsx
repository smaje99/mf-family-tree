import Link from "next/link";
import { formatLifeSpan, type PersonCardData } from "@/lib/family-tree";

type PersonCardProps = {
  readonly person: PersonCardData;
  readonly href?: string;
};

export function PersonCard({ person, href }: PersonCardProps) {
  const lifeSpan = formatLifeSpan(person.birthDate, person.deathDate);

  return (
    <Link
      href={href ?? `/personas/${person.id}`}
      className="group flex h-full flex-col justify-between rounded-[1.6rem] border border-line bg-paper-strong/90 p-5 shadow-[0_18px_40px_rgb(74_45_22_/_0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_24px_50px_rgb(74_45_22_/_0.1)]"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              {person.id}
            </p>
            <h3 className="font-display text-2xl leading-tight text-ink">
              {person.displayName}
            </h3>
            {person.alias ? (
              <p className="text-sm text-muted">Alias: {person.alias}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted">
          <p>{lifeSpan ?? "Cronología aún abierta"}</p>
          <p>
            {person.parentFamilyCount} rama
            {person.parentFamilyCount === 1 ? "" : "s"} de origen y {person.familyCount} nodo
            {person.familyCount === 1 ? "" : "s"} familiar{person.familyCount === 1 ? "" : "es"} propio
            {person.familyCount === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-brand-strong">
        <span className="rounded-full bg-brand-soft px-3 py-1">
          {person.childrenCount} vínculo{person.childrenCount === 1 ? "" : "s"} filial
          {person.childrenCount === 1 ? "" : "es"}
        </span>
        <span className="rounded-full bg-brand-soft/70 px-3 py-1">
          {person.noteCount} nota{person.noteCount === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
