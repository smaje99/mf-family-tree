type ConfidencePillProps = {
  readonly confidence: string | null;
};

const confidenceStyles: Record<string, string> = {
  high: "border-signal-high/20 bg-signal-high/10 text-signal-high",
  medium: "border-signal-medium/20 bg-signal-medium/10 text-signal-medium",
  low: "border-signal-low/20 bg-signal-low/10 text-signal-low"
};

const confidenceLabels: Record<string, string> = {
  high: "Alta confianza",
  medium: "Confianza media",
  low: "Baja confianza"
};

export function ConfidencePill({ confidence }: ConfidencePillProps) {
  const key = confidence ?? "open";
  const styles =
    confidenceStyles[key] ?? "border-brand/15 bg-brand/8 text-brand-strong";
  const label = confidenceLabels[key] ?? "Confianza abierta";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}
    >
      {label}
    </span>
  );
}
