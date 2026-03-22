import { getHomepageSnapshot } from "@/lib/homepage";

export default function HomePage() {
  const snapshot = getHomepageSnapshot();

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Casa Majé Franco</p>
        <h1>Archivo familiar vivo</h1>
        <p>
          Base inicial para una aplicación local-first del árbol familiar. Esta
          portada ya lee el estado de la base SQLite cuando existe y sirve como
          punto de entrada para la siguiente fase: fichas de personas, vista de
          árbol, historias y galería.
        </p>
        <div className="metrics">
          <article className="metric-card">
            <strong>{snapshot.counts.persons}</strong>
            <span>personas</span>
          </article>
          <article className="metric-card">
            <strong>{snapshot.counts.families}</strong>
            <span>familias</span>
          </article>
          <article className="metric-card">
            <strong>{snapshot.counts.media}</strong>
            <span>medios</span>
          </article>
          <article className="metric-card">
            <strong>{snapshot.counts.stories}</strong>
            <span>historias</span>
          </article>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Estado actual</h2>
          <p>{snapshot.statusMessage}</p>
          <ul>
            {snapshot.people.map((person) => (
              <li key={person.id}>
                {person.displayName}
                {person.alias ? ` (${person.alias})` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Siguiente capa funcional</h2>
          <ul>
            <li>Vista de árbol navegable con nodos de persona y familia.</li>
            <li>Fichas enriquecidas con notas, fuentes, fotos e historias.</li>
            <li>Galería y cronología construidas sobre la misma base local.</li>
            <li>Cola de revisión para datos con confianza baja o parcial.</li>
          </ul>
        </section>
      </div>

      <section className="banner">
        {snapshot.isReady ? (
          <p>
            La base SQLite está lista. Para seguir, ejecuta <code>pnpm dev</code>
            {" "}y empieza a construir las vistas reales sobre este modelo.
          </p>
        ) : (
          <p>
            La base todavía no existe o no está migrada. Ejecuta{" "}
            <code>pnpm db:setup</code> y luego <code>pnpm import:tree</code>.
          </p>
        )}
      </section>
    </main>
  );
}
