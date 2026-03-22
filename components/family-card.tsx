import Link from "next/link";
import { ConfidencePill } from "@/components/confidence-pill";
import { familyLabel, type FamilySummary } from "@/lib/family-tree";

type FamilyCardProps = {
  readonly family: FamilySummary;
};

export function FamilyCard({ family }: FamilyCardProps) {
  return (
    <Link
      href={`/familias/${family.id}`}
      className="group flex h-full flex-col justify-between rounded-[1.6rem] border border-line bg-white/65 p-5 shadow-[0_16px_36px_rgb(74_45_22_/_0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_24px_50px_rgb(74_45_22_/_0.09)]"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              {family.id}
            </p>
            <h3 className="font-display text-2xl leading-tight text-ink">
              {familyLabel(family)}
            </h3>
            <p className="text-sm text-muted">
              {family.relationshipType ?? "Tipo de relación pendiente"}
            </p>
          </div>
          <ConfidencePill confidence={family.confidence} />
        </div>

        <div className="space-y-2 text-sm text-muted">
          <p>
            {family.childrenCount} hijo{family.childrenCount === 1 ? "" : "s"} registrado
            {family.childrenCount === 1 ? "" : "s"}.
          </p>
          <p>{family.placeName ?? "Sin lugar asociado todavía."}</p>
          {family.notesMarkdown ? <p className="line-clamp-3">{family.notesMarkdown}</p> : null}
        </div>
      </div>

      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
        Abrir familia
      </div>
    </Link>
  );
}
