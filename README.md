# Casa Majé Franco

Base inicial de la aplicación local-first para el árbol familiar de la casa Majé Franco.

## Comandos

```bash
pnpm install
pnpm db:setup
pnpm import:tree
pnpm dev
```

## Qué incluye esta base

- estructura inicial en `Next.js`;
- esquema SQLite en [`db/migrations/0001_initial.sql`](/home/smaje/Documentos/Projects/2026/mf-family-tree/db/migrations/0001_initial.sql);
- definiciones Drizzle en [`db/schema.ts`](/home/smaje/Documentos/Projects/2026/mf-family-tree/db/schema.ts);
- script de importación desde [`arbol_franco_cardona_gramps_like.json`](/home/smaje/Documentos/Projects/2026/mf-family-tree/arbol_franco_cardona_gramps_like.json);
- portada mínima que lee el estado de la base local.
