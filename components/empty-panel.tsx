type EmptyPanelProps = {
  readonly title: string;
  readonly description: string;
};

export function EmptyPanel({ title, description }: EmptyPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-line bg-white/55 p-6">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
    </section>
  );
}
