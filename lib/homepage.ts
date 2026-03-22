import { existsSync } from "node:fs";
import { getDatabasePath, openSqliteDatabase } from "@/lib/sqlite";

type HomepagePerson = {
  id: string;
  displayName: string;
  alias: string | null;
};

type HomepageSnapshot = {
  counts: {
    persons: number;
    families: number;
    media: number;
    stories: number;
  };
  isReady: boolean;
  people: HomepagePerson[];
  statusMessage: string;
};

export function getHomepageSnapshot(): HomepageSnapshot {
  const databasePath = getDatabasePath();

  if (!existsSync(databasePath)) {
    return {
      counts: { persons: 0, families: 0, media: 0, stories: 0 },
      isReady: false,
      people: [],
      statusMessage:
        "Todavía no hay una base local creada. El proyecto ya tiene migraciones e importador, pero falta ejecutarlos."
    };
  }

  const sqlite = openSqliteDatabase();

  try {
    const tablesReady = sqlite
      .prepare(
        "SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table' AND name IN ('persons', 'families', 'media_assets', 'stories')"
      )
      .get() as { total: number };

    if (tablesReady.total < 4) {
      return {
        counts: { persons: 0, families: 0, media: 0, stories: 0 },
        isReady: false,
        people: [],
        statusMessage:
          "La base existe, pero aún no tiene el esquema completo aplicado."
      };
    }

    const counts = {
      persons:
        (sqlite.prepare("SELECT COUNT(*) AS total FROM persons").get() as {
          total: number;
        }).total ?? 0,
      families:
        (sqlite.prepare("SELECT COUNT(*) AS total FROM families").get() as {
          total: number;
        }).total ?? 0,
      media:
        (sqlite.prepare("SELECT COUNT(*) AS total FROM media_assets").get() as {
          total: number;
        }).total ?? 0,
      stories:
        (sqlite.prepare("SELECT COUNT(*) AS total FROM stories").get() as {
          total: number;
        }).total ?? 0
    };

    const people = sqlite
      .prepare(
        "SELECT id, display_name AS displayName, alias FROM persons ORDER BY display_name ASC LIMIT 8"
      )
      .all() as HomepagePerson[];

    return {
      counts,
      isReady: true,
      people,
      statusMessage:
        counts.persons > 0
          ? "La base ya está alimentada y lista para las vistas reales del árbol."
          : "La base está migrada, pero todavía no tiene datos importados."
    };
  } catch {
    return {
      counts: { persons: 0, families: 0, media: 0, stories: 0 },
      isReady: false,
      people: [],
      statusMessage:
        "La base local no pudo leerse correctamente; revisa las migraciones y la importación."
    };
  } finally {
    sqlite.close();
  }
}
