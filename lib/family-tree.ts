import { existsSync } from "node:fs";
import { getDatabasePath, openSqliteDatabase } from "@/lib/sqlite";

export type PersonCardData = {
  id: string;
  displayName: string;
  alias: string | null;
  confidence: string | null;
  birthDate: string | null;
  deathDate: string | null;
  familyCount: number;
  parentFamilyCount: number;
  childrenCount: number;
  noteCount: number;
  gender?: string | null;
  isLiving?: boolean;
};

export type FamilySummary = {
  id: string;
  parent1Id: string | null;
  parent1Name: string | null;
  parent2Id: string | null;
  parent2Name: string | null;
  relationshipType: string | null;
  confidence: string | null;
  placeName: string | null;
  childrenCount: number;
  notesMarkdown: string | null;
};

export type NoteItem = {
  id: string;
  content: string;
};

export type CitationItem = {
  id: string;
  page: string | null;
  confidence: string | null;
  notesMarkdown: string | null;
  sourceId: string | null;
  sourceTitle: string | null;
  sourceAbbreviation: string | null;
};

export type MediaItem = {
  id: string;
  title: string;
  filePath: string | null;
  mimeType: string | null;
  role: string | null;
};

export type EventItem = {
  id: string;
  type: string;
  dateOriginal: string | null;
  datePrecision: string | null;
  isApproximate: boolean;
  description: string | null;
};

export type FamilyWithChildren = FamilySummary & {
  children: PersonCardData[];
};

export type HomePageData = {
  isReady: boolean;
  counts: {
    persons: number;
    families: number;
    media: number;
    stories: number;
  };
  statusMessage: string;
  householdPeople: PersonCardData[];
  featurePeople: PersonCardData[];
  featureFamilies: FamilySummary[];
  globalNotes: NoteItem[];
  focusPersonId: string | null;
};

export type TreeOverviewData = {
  isReady: boolean;
  focusPersonId: string | null;
  entryPeople: PersonCardData[];
  householdPeople: PersonCardData[];
  families: FamilySummary[];
  lowConfidencePeople: PersonCardData[];
  lowConfidenceFamilies: FamilySummary[];
  globalNotes: NoteItem[];
};

export type PersonDetailData = {
  person: PersonCardData;
  events: EventItem[];
  notes: NoteItem[];
  citations: CitationItem[];
  media: MediaItem[];
  parentFamilies: FamilyWithChildren[];
  ownFamilies: FamilyWithChildren[];
  siblings: PersonCardData[];
  partners: PersonCardData[];
  children: PersonCardData[];
};

export type FamilyDetailData = {
  family: FamilyWithChildren;
  parents: PersonCardData[];
  notes: NoteItem[];
  citations: CitationItem[];
  media: MediaItem[];
};

function withDatabase<T>(fallback: T, callback: (sqlite: ReturnType<typeof openSqliteDatabase>) => T) {
  const databasePath = getDatabasePath();

  if (!existsSync(databasePath)) {
    return fallback;
  }

  const sqlite = openSqliteDatabase();

  try {
    const ready = sqlite
      .prepare(
        "SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table' AND name IN ('persons', 'families', 'media_assets', 'stories')"
      )
      .get() as { total: number };

    if (ready.total < 4) {
      return fallback;
    }

    return callback(sqlite);
  } catch {
    return fallback;
  } finally {
    sqlite.close();
  }
}

function getCounts(sqlite: ReturnType<typeof openSqliteDatabase>) {
  return {
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
}

function basePersonSelect() {
  return `
    SELECT
      p.id,
      p.display_name AS displayName,
      p.alias,
      p.confidence,
      p.gender,
      p.is_living AS isLiving,
      (
        SELECT e.date_original
        FROM events e
        WHERE e.person_id = p.id AND e.type = 'Birth'
        ORDER BY e.id
        LIMIT 1
      ) AS birthDate,
      (
        SELECT e.date_original
        FROM events e
        WHERE e.person_id = p.id AND e.type = 'Death'
        ORDER BY e.id
        LIMIT 1
      ) AS deathDate,
      (
        SELECT COUNT(*)
        FROM families f
        WHERE f.parent1_id = p.id OR f.parent2_id = p.id
      ) AS familyCount,
      (
        SELECT COUNT(*)
        FROM family_children fc
        WHERE fc.person_id = p.id
      ) AS parentFamilyCount,
      (
        SELECT COUNT(*)
        FROM family_children fc
        WHERE fc.family_id IN (
          SELECT f.id
          FROM families f
          WHERE f.parent1_id = p.id OR f.parent2_id = p.id
        )
      ) AS childrenCount,
      (
        SELECT COUNT(*)
        FROM notes n
        WHERE n.entity_type = 'person' AND n.entity_id = p.id
      ) AS noteCount
    FROM persons p
  `;
}

function familySelect() {
  return `
    SELECT
      f.id,
      f.parent1_id AS parent1Id,
      p1.display_name AS parent1Name,
      f.parent2_id AS parent2Id,
      p2.display_name AS parent2Name,
      f.relationship_type AS relationshipType,
      f.confidence,
      pl.name AS placeName,
      f.notes_markdown AS notesMarkdown,
      (
        SELECT COUNT(*)
        FROM family_children fc
        WHERE fc.family_id = f.id
      ) AS childrenCount
    FROM families f
    LEFT JOIN persons p1 ON p1.id = f.parent1_id
    LEFT JOIN persons p2 ON p2.id = f.parent2_id
    LEFT JOIN places pl ON pl.id = f.place_id
  `;
}

function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value === "string") {
    return value;
  }

  throw new TypeError(`${fieldName} must be a string.`);
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function mapPersonRow(row: Record<string, unknown>): PersonCardData {
  const id = readRequiredString(row.id, "person.id");

  return {
    id,
    displayName: readOptionalString(row.displayName) ?? id,
    alias: readOptionalString(row.alias),
    confidence: readOptionalString(row.confidence),
    birthDate: readOptionalString(row.birthDate),
    deathDate: readOptionalString(row.deathDate),
    familyCount: readNumber(row.familyCount),
    parentFamilyCount: readNumber(row.parentFamilyCount),
    childrenCount: readNumber(row.childrenCount),
    noteCount: readNumber(row.noteCount),
    gender: readOptionalString(row.gender),
    isLiving: readNumber(row.isLiving) === 1
  };
}

function mapFamilyRow(row: Record<string, unknown>): FamilySummary {
  const id = readRequiredString(row.id, "family.id");

  return {
    id,
    parent1Id: readOptionalString(row.parent1Id),
    parent1Name: readOptionalString(row.parent1Name),
    parent2Id: readOptionalString(row.parent2Id),
    parent2Name: readOptionalString(row.parent2Name),
    relationshipType: readOptionalString(row.relationshipType),
    confidence: readOptionalString(row.confidence),
    placeName: readOptionalString(row.placeName),
    childrenCount: readNumber(row.childrenCount),
    notesMarkdown: readOptionalString(row.notesMarkdown)
  };
}

function getNotesForEntity(
  sqlite: ReturnType<typeof openSqliteDatabase>,
  entityType: string,
  entityId: string
) {
  return sqlite
    .prepare(
      `
        SELECT id, content_markdown AS content
        FROM notes
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY id
      `
    )
    .all(entityType, entityId) as NoteItem[];
}

function getCitationsForEntity(
  sqlite: ReturnType<typeof openSqliteDatabase>,
  entityType: string,
  entityId: string
) {
  return sqlite
    .prepare(
      `
        SELECT
          c.id,
          c.page,
          c.confidence,
          c.notes_markdown AS notesMarkdown,
          s.id AS sourceId,
          s.title AS sourceTitle,
          s.abbreviation AS sourceAbbreviation
        FROM entity_citations ec
        JOIN citations c ON c.id = ec.citation_id
        LEFT JOIN sources s ON s.id = c.source_id
        WHERE ec.entity_type = ? AND ec.entity_id = ?
        ORDER BY c.id
      `
    )
    .all(entityType, entityId) as CitationItem[];
}

function getPersonMedia(sqlite: ReturnType<typeof openSqliteDatabase>, personId: string) {
  return sqlite
    .prepare(
      `
        SELECT
          m.id,
          m.title,
          m.file_path AS filePath,
          m.mime_type AS mimeType,
          pm.role
        FROM person_media pm
        JOIN media_assets m ON m.id = pm.media_id
        WHERE pm.person_id = ?
        ORDER BY pm.sort_order, m.title
      `
    )
    .all(personId) as MediaItem[];
}

function getFamilyMedia(sqlite: ReturnType<typeof openSqliteDatabase>, familyId: string) {
  return sqlite
    .prepare(
      `
        SELECT
          m.id,
          m.title,
          m.file_path AS filePath,
          m.mime_type AS mimeType,
          fm.role
        FROM family_media fm
        JOIN media_assets m ON m.id = fm.media_id
        WHERE fm.family_id = ?
        ORDER BY m.title
      `
    )
    .all(familyId) as MediaItem[];
}

function getEventsForPerson(sqlite: ReturnType<typeof openSqliteDatabase>, personId: string) {
  return sqlite
    .prepare(
      `
        SELECT
          id,
          type,
          date_original AS dateOriginal,
          date_precision AS datePrecision,
          is_approximate AS isApproximate,
          description
        FROM events
        WHERE person_id = ?
        ORDER BY
          CASE type
            WHEN 'Birth' THEN 1
            WHEN 'Death' THEN 99
            ELSE 50
          END,
          id
      `
    )
    .all(personId)
    .map((row) => ({
      ...(row as Omit<EventItem, "isApproximate">),
      isApproximate: Number((row as { isApproximate: number }).isApproximate) === 1
    }));
}

function getPersonById(sqlite: ReturnType<typeof openSqliteDatabase>, personId: string) {
  const row = sqlite
    .prepare(`${basePersonSelect()} WHERE p.id = ?`)
    .get(personId) as Record<string, unknown> | undefined;

  return row ? mapPersonRow(row) : null;
}

function getPeopleByIds(sqlite: ReturnType<typeof openSqliteDatabase>, personIds: string[]) {
  const uniqueIds = Array.from(new Set(personIds));

  return uniqueIds
    .map((personId) => getPersonById(sqlite, personId))
    .filter((person): person is PersonCardData => person !== null);
}

function getFamilyById(sqlite: ReturnType<typeof openSqliteDatabase>, familyId: string) {
  const row = sqlite
    .prepare(`${familySelect()} WHERE f.id = ?`)
    .get(familyId) as Record<string, unknown> | undefined;

  return row ? mapFamilyRow(row) : null;
}

function getFamilyChildren(sqlite: ReturnType<typeof openSqliteDatabase>, familyId: string) {
  return sqlite
    .prepare(
      `
        ${basePersonSelect()}
        JOIN family_children fc ON fc.person_id = p.id
        WHERE fc.family_id = ?
        ORDER BY fc.sort_order, p.display_name
      `
    )
    .all(familyId)
    .map((row) => mapPersonRow(row as Record<string, unknown>));
}

function getFamilyWithChildren(
  sqlite: ReturnType<typeof openSqliteDatabase>,
  familyId: string
) {
  const family = getFamilyById(sqlite, familyId);

  if (!family) {
    return null;
  }

  return {
    ...family,
    children: getFamilyChildren(sqlite, familyId)
  };
}

function getFamiliesForParent(
  sqlite: ReturnType<typeof openSqliteDatabase>,
  personId: string
) {
  const rows = sqlite
    .prepare(
      `
        ${familySelect()}
        WHERE f.parent1_id = ? OR f.parent2_id = ?
        ORDER BY f.id
      `
    )
    .all(personId, personId) as Record<string, unknown>[];

  return rows.map((row) => ({
    ...mapFamilyRow(row),
    children: getFamilyChildren(sqlite, readRequiredString(row.id, "family.id"))
  }));
}

function getFamiliesForChild(
  sqlite: ReturnType<typeof openSqliteDatabase>,
  personId: string
) {
  const rows = sqlite
    .prepare(
      `
        ${familySelect()}
        JOIN family_children fc ON fc.family_id = f.id
        WHERE fc.person_id = ?
        ORDER BY f.id
      `
    )
    .all(personId) as Record<string, unknown>[];

  return rows.map((row) => ({
    ...mapFamilyRow(row),
    children: getFamilyChildren(sqlite, readRequiredString(row.id, "family.id"))
  }));
}

export function formatLifeSpan(birthDate: string | null, deathDate: string | null) {
  if (!birthDate && !deathDate) {
    return null;
  }

  if (birthDate && deathDate) {
    return `${birthDate} - ${deathDate}`;
  }

  if (birthDate) {
    return `Nació ${birthDate}`;
  }

  return `Murió ${deathDate}`;
}

export function familyLabel(family: FamilySummary) {
  const parts = [family.parent1Name, family.parent2Name].filter(Boolean);

  if (parts.length === 0) {
    return "Rama familiar en revisión";
  }

  if (parts.length === 1) {
    return `Descendencia de ${parts[0]}`;
  }

  return `${parts[0]} + ${parts[1]}`;
}

export function getHomePageData(): HomePageData {
  return withDatabase<HomePageData>(
    {
      isReady: false,
      counts: { persons: 0, families: 0, media: 0, stories: 0 },
      statusMessage:
        "El archivo local aún no está listo. Ejecuta la preparación de base e importa los datos para habilitar las vistas familiares.",
      householdPeople: [],
      featurePeople: [],
      featureFamilies: [],
      globalNotes: [],
      focusPersonId: null
    },
    (sqlite) => {
      const counts = getCounts(sqlite);
      const householdPeople = sqlite
        .prepare(
          `
            ${basePersonSelect()}
            WHERE p.display_name LIKE '%Majé%' OR p.display_name LIKE '%Maje%'
            ORDER BY p.display_name
            LIMIT 6
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>));

      const featurePeople = sqlite
        .prepare(
          `
            ${basePersonSelect()}
            ORDER BY childrenCount DESC, familyCount DESC, p.display_name ASC
            LIMIT 6
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>));

      const featureFamilies = sqlite
        .prepare(
          `
            ${familySelect()}
            ORDER BY childrenCount DESC, f.id ASC
            LIMIT 6
          `
        )
        .all()
        .map((row) => mapFamilyRow(row as Record<string, unknown>));

      const globalNotes = getNotesForEntity(sqlite, "global", "global");
      const focusPersonId = householdPeople[0]?.id ?? featurePeople[0]?.id ?? null;

        return {
        isReady: true,
        counts,
        statusMessage:
          counts.persons > 0
            ? "El archivo ya está activo en SQLite y refleja el conjunto actual de la familia Majé Franco."
            : "El esquema existe, pero el árbol familiar todavía no ha sido importado.",
        householdPeople,
        featurePeople,
        featureFamilies,
        globalNotes,
        focusPersonId
      };
    }
  );
}

export function getTreeOverviewData(): TreeOverviewData {
  return withDatabase<TreeOverviewData>(
    {
      isReady: false,
      focusPersonId: null,
      entryPeople: [],
      householdPeople: [],
      families: [],
      lowConfidencePeople: [],
      lowConfidenceFamilies: [],
      globalNotes: []
    },
    (sqlite) => {
      const entryPeople = sqlite
        .prepare(
          `
            ${basePersonSelect()}
            WHERE childrenCount > 0 OR familyCount > 0
            ORDER BY childrenCount DESC, familyCount DESC, p.display_name ASC
            LIMIT 12
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>));

      const householdPeople = sqlite
        .prepare(
          `
            ${basePersonSelect()}
            WHERE p.display_name LIKE '%Majé%' OR p.display_name LIKE '%Maje%'
            ORDER BY p.display_name ASC
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>));

      const families = sqlite
        .prepare(
          `
            ${familySelect()}
            ORDER BY childrenCount DESC, f.id ASC
          `
        )
        .all()
        .map((row) => mapFamilyRow(row as Record<string, unknown>));

      const lowConfidencePeople = sqlite
        .prepare(
          `
            ${basePersonSelect()}
            WHERE p.confidence = 'low'
            ORDER BY p.display_name
            LIMIT 8
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>));

      const lowConfidenceFamilies = sqlite
        .prepare(
          `
            ${familySelect()}
            WHERE f.confidence = 'low'
            ORDER BY f.id
            LIMIT 8
          `
        )
        .all()
        .map((row) => mapFamilyRow(row as Record<string, unknown>));

      return {
        isReady: true,
        focusPersonId: householdPeople[0]?.id ?? entryPeople[0]?.id ?? null,
        entryPeople,
        householdPeople,
        families,
        lowConfidencePeople,
        lowConfidenceFamilies,
        globalNotes: getNotesForEntity(sqlite, "global", "global")
      };
    }
  );
}

export function getPeopleDirectory() {
  return withDatabase<PersonCardData[]>(
    [],
    (sqlite) =>
      sqlite
        .prepare(
          `
            ${basePersonSelect()}
            ORDER BY p.display_name ASC
          `
        )
        .all()
        .map((row) => mapPersonRow(row as Record<string, unknown>))
  );
}

export function getPersonDetail(personId: string) {
  return withDatabase<PersonDetailData | null>(null, (sqlite) => {
    const person = getPersonById(sqlite, personId);

    if (!person) {
      return null;
    }

    const parentFamilies = getFamiliesForChild(sqlite, personId);
    const ownFamilies = getFamiliesForParent(sqlite, personId);
    const siblingsMap = new Map<string, PersonCardData>();
    const partnerMap = new Map<string, PersonCardData>();
    const childrenMap = new Map<string, PersonCardData>();

    for (const family of parentFamilies) {
      for (const sibling of family.children) {
        if (sibling.id !== personId) {
          siblingsMap.set(sibling.id, sibling);
        }
      }
    }

    for (const family of ownFamilies) {
      const partnerIds = [family.parent1Id, family.parent2Id].filter(
        (candidate): candidate is string => Boolean(candidate && candidate !== personId)
      );

      for (const partnerId of partnerIds) {
        const partner = getPersonById(sqlite, partnerId);

        if (partner) {
          partnerMap.set(partner.id, partner);
        }
      }

      for (const child of family.children) {
        childrenMap.set(child.id, child);
      }
    }

    return {
      person,
      events: getEventsForPerson(sqlite, personId),
      notes: getNotesForEntity(sqlite, "person", personId),
      citations: getCitationsForEntity(sqlite, "person", personId),
      media: getPersonMedia(sqlite, personId),
      parentFamilies,
      ownFamilies,
      siblings: Array.from(siblingsMap.values()).sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
      ),
      partners: Array.from(partnerMap.values()).sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
      ),
      children: Array.from(childrenMap.values()).sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
      )
    };
  });
}

export function getFamilyDetail(familyId: string) {
  return withDatabase<FamilyDetailData | null>(null, (sqlite) => {
    const family = getFamilyWithChildren(sqlite, familyId);

    if (!family) {
      return null;
    }

    const parents = getPeopleByIds(
      sqlite,
      [family.parent1Id, family.parent2Id].filter(
        (personId): personId is string => Boolean(personId)
      )
    );

    return {
      family,
      parents,
      notes: getNotesForEntity(sqlite, "family", familyId),
      citations: getCitationsForEntity(sqlite, "family", familyId),
      media: getFamilyMedia(sqlite, familyId)
    };
  });
}
