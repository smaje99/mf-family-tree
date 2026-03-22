import { readFileSync } from "node:fs";
import path from "node:path";
import { applyMigrations } from "../db/migrate";
import { openSqliteDatabase } from "../lib/sqlite";

type TopLevelNote = {
  id: string;
  type?: string;
  text?: string;
  citations?: string[];
};

type Person = {
  id: string;
  gramps_id?: string;
  primary_name?: {
    given?: string;
    surname?: string;
    alias?: string;
    display?: string;
  };
  gender?: string;
  events?: Array<{
    type?: string;
    date?: string;
    place?: string;
    description?: string;
  }>;
  notes?: string[];
  media_refs?: string[];
  citation_refs?: string[];
};

type Family = {
  id: string;
  gramps_id?: string;
  parent1_id?: string | null;
  parent2_id?: string | null;
  relationship_type?: string;
  children_ids?: string[];
  events?: Array<{
    type?: string;
    date?: string;
    place?: string;
    description?: string;
  }>;
  places?: string[];
  notes?: string[];
  media_refs?: string[];
  citation_refs?: string[];
};

type Source = {
  id: string;
  title: string;
  author?: string;
  abbreviation?: string;
  publication_info?: string;
  repository_refs?: string[];
};

type Citation = {
  id: string;
  source_id?: string;
  page?: string;
  notes?: string[];
};

type Media = {
  id: string;
  title: string;
  file_hint?: string;
  mime_type?: string;
  citations?: string[];
};

type Place = {
  id: string;
  name: string;
  type?: string;
  notes?: string[];
  citations?: string[];
};

type ImportPayload = {
  persons?: Person[];
  families?: Family[];
  media?: Media[];
  notes?: TopLevelNote[];
  sources?: Source[];
  citations?: Citation[];
  places?: Place[];
};

function toJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

function joinLines(lines?: string[]) {
  return lines && lines.length > 0 ? lines.join("\n\n") : null;
}

function inferDatePrecision(raw?: string) {
  if (!raw) {
    return null;
  }

  const parts = raw.split("/");

  if (parts.length === 3) {
    if (parts[0] === "0" || parts[1] === "0") {
      return "partial";
    }

    return "day";
  }

  if (/^\d{4}$/.test(raw)) {
    return "year";
  }

  return "raw";
}

function inferApproximate(raw?: string) {
  if (!raw) {
    return 0;
  }

  return /dudoso|probable|ilegible|\?/.test(raw.toLowerCase()) ? 1 : 0;
}

function noteId(prefix: string, entityId: string, index: number) {
  return `${prefix}:${entityId}:note:${index + 1}`;
}

const inputArg = process.argv[2] ?? "arbol_franco_cardona_gramps_like.json";
const inputPath = path.isAbsolute(inputArg)
  ? inputArg
  : path.join(process.cwd(), inputArg);

const payload = JSON.parse(readFileSync(inputPath, "utf8")) as ImportPayload;
const sqlite = openSqliteDatabase();

try {
  applyMigrations(sqlite);

  const now = new Date().toISOString();

  const upsertPerson = sqlite.prepare(`
    INSERT OR REPLACE INTO persons (
      id, external_id, given_name, surname, display_name, alias, gender,
      is_living, summary, profile_photo_media_id, raw_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertFamily = sqlite.prepare(`
    INSERT OR REPLACE INTO families (
      id, external_id, parent1_id, parent2_id, relationship_type,
      notes_markdown, place_id, raw_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertEvent = sqlite.prepare(`
    INSERT OR REPLACE INTO events (
      id, person_id, family_id, type, date_original, date_sort_start,
      date_sort_end, date_precision, is_approximate, place_id,
      description, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertFamilyChild = sqlite.prepare(`
    INSERT OR REPLACE INTO family_children (family_id, person_id, sort_order)
    VALUES (?, ?, ?)
  `);

  const upsertNote = sqlite.prepare(`
    INSERT OR REPLACE INTO notes (id, entity_type, entity_id, content_markdown, visibility, raw_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const upsertSource = sqlite.prepare(`
    INSERT OR REPLACE INTO sources (id, title, author, abbreviation, publication_info, repository_ref, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertCitation = sqlite.prepare(`
    INSERT OR REPLACE INTO citations (id, source_id, page, notes_markdown, raw_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  const upsertEntityCitation = sqlite.prepare(`
    INSERT OR REPLACE INTO entity_citations (citation_id, entity_type, entity_id)
    VALUES (?, ?, ?)
  `);

  const upsertMedia = sqlite.prepare(`
    INSERT OR REPLACE INTO media_assets (
      id, kind, title, file_path, thumbnail_path, mime_type, caption,
      date_original, place_id, source_id, raw_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertPersonMedia = sqlite.prepare(`
    INSERT OR REPLACE INTO person_media (person_id, media_id, role, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  const upsertFamilyMedia = sqlite.prepare(`
    INSERT OR REPLACE INTO family_media (family_id, media_id, role)
    VALUES (?, ?, ?)
  `);

  const upsertPlace = sqlite.prepare(`
    INSERT OR REPLACE INTO places (id, name, type, latitude, longitude, notes_markdown, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const deleteEventsByPerson = sqlite.prepare("DELETE FROM events WHERE person_id = ?");
  const deleteEventsByFamily = sqlite.prepare("DELETE FROM events WHERE family_id = ?");
  const deleteNotesByEntity = sqlite.prepare(
    "DELETE FROM notes WHERE entity_type = ? AND entity_id = ?"
  );
  const deleteEntityCitationsByEntity = sqlite.prepare(
    "DELETE FROM entity_citations WHERE entity_type = ? AND entity_id = ?"
  );
  const deletePersonMediaByPerson = sqlite.prepare(
    "DELETE FROM person_media WHERE person_id = ?"
  );
  const deleteFamilyMediaByFamily = sqlite.prepare(
    "DELETE FROM family_media WHERE family_id = ?"
  );
  const deleteFamilyChildrenByFamily = sqlite.prepare(
    "DELETE FROM family_children WHERE family_id = ?"
  );

  const transaction = sqlite.transaction(() => {
    for (const source of payload.sources ?? []) {
      upsertSource.run(
        source.id,
        source.title,
        source.author ?? null,
        source.abbreviation ?? null,
        source.publication_info ?? null,
        source.repository_refs?.join(", ") ?? null,
        toJson(source)
      );
    }

    for (const citation of payload.citations ?? []) {
      upsertCitation.run(
        citation.id,
        citation.source_id ?? null,
        citation.page ?? null,
        joinLines(citation.notes) ?? null,
        toJson(citation)
      );
    }

    for (const place of payload.places ?? []) {
      upsertPlace.run(
        place.id,
        place.name,
        place.type ?? null,
        null,
        null,
        joinLines(place.notes) ?? null,
        toJson(place)
      );

      deleteEntityCitationsByEntity.run("place", place.id);

      for (const citationId of place.citations ?? []) {
        upsertEntityCitation.run(citationId, "place", place.id);
      }
    }

    for (const media of payload.media ?? []) {
      upsertMedia.run(
        media.id,
        "image",
        media.title,
        media.file_hint ?? null,
        null,
        media.mime_type ?? null,
        null,
        null,
        null,
        null,
        toJson(media),
        now
      );

      deleteEntityCitationsByEntity.run("media", media.id);

      for (const citationId of media.citations ?? []) {
        upsertEntityCitation.run(citationId, "media", media.id);
      }
    }

    for (const person of payload.persons ?? []) {
      deleteEventsByPerson.run(person.id);
      deleteNotesByEntity.run("person", person.id);
      deleteEntityCitationsByEntity.run("person", person.id);
      deletePersonMediaByPerson.run(person.id);

      const hasDeathEvent = (person.events ?? []).some(
        (event) => event.type?.toLowerCase() === "death"
      );

      upsertPerson.run(
        person.id,
        person.gramps_id ?? null,
        person.primary_name?.given ?? null,
        person.primary_name?.surname ?? null,
        person.primary_name?.display ?? person.id,
        person.primary_name?.alias ?? null,
        person.gender ?? null,
        hasDeathEvent ? 0 : 1,
        null,
        person.media_refs?.[0] ?? null,
        toJson(person),
        now,
        now
      );

      (person.events ?? []).forEach((event, index) => {
        upsertEvent.run(
          `${person.id}:event:${index + 1}`,
          person.id,
          null,
          event.type ?? "Unknown",
          event.date ?? null,
          null,
          null,
          inferDatePrecision(event.date),
          inferApproximate(event.date),
          event.place ?? null,
          event.description ?? null,
          toJson(event)
        );
      });

      (person.notes ?? []).forEach((note, index) => {
        upsertNote.run(
          noteId("person", person.id, index),
          "person",
          person.id,
          note,
          "public",
          toJson({ text: note })
        );
      });

      (person.citation_refs ?? []).forEach((citationId) => {
        upsertEntityCitation.run(citationId, "person", person.id);
      });

      (person.media_refs ?? []).forEach((mediaId, index) => {
        upsertPersonMedia.run(person.id, mediaId, index === 0 ? "profile" : "gallery", index + 1);
      });
    }

    for (const family of payload.families ?? []) {
      deleteEventsByFamily.run(family.id);
      deleteNotesByEntity.run("family", family.id);
      deleteEntityCitationsByEntity.run("family", family.id);
      deleteFamilyMediaByFamily.run(family.id);
      deleteFamilyChildrenByFamily.run(family.id);

      upsertFamily.run(
        family.id,
        family.gramps_id ?? null,
        family.parent1_id ?? null,
        family.parent2_id ?? null,
        family.relationship_type ?? null,
        joinLines(family.notes) ?? null,
        family.places?.[0] ?? null,
        toJson(family),
        now,
        now
      );

      (family.children_ids ?? []).forEach((childId, index) => {
        upsertFamilyChild.run(family.id, childId, index + 1);
      });

      (family.events ?? []).forEach((event, index) => {
        upsertEvent.run(
          `${family.id}:event:${index + 1}`,
          null,
          family.id,
          event.type ?? "Unknown",
          event.date ?? null,
          null,
          null,
          inferDatePrecision(event.date),
          inferApproximate(event.date),
          event.place ?? family.places?.[0] ?? null,
          event.description ?? null,
          toJson(event)
        );
      });

      (family.notes ?? []).forEach((note, index) => {
        upsertNote.run(
          noteId("family", family.id, index),
          "family",
          family.id,
          note,
          "public",
          toJson({ text: note })
        );
      });

      (family.citation_refs ?? []).forEach((citationId) => {
        upsertEntityCitation.run(citationId, "family", family.id);
      });

      (family.media_refs ?? []).forEach((mediaId) => {
        upsertFamilyMedia.run(family.id, mediaId, "gallery");
      });
    }

    for (const note of payload.notes ?? []) {
      deleteEntityCitationsByEntity.run("note", note.id);

      upsertNote.run(
        note.id,
        "global",
        "global",
        note.text ?? "",
        "public",
        toJson(note)
      );

      for (const citationId of note.citations ?? []) {
        upsertEntityCitation.run(citationId, "note", note.id);
      }
    }
  });

  transaction();

  const personsTotal = (sqlite.prepare("SELECT COUNT(*) AS total FROM persons").get() as {
    total: number;
  }).total;
  const familiesTotal = (
    sqlite.prepare("SELECT COUNT(*) AS total FROM families").get() as {
      total: number;
    }
  ).total;
  const mediaTotal = (sqlite.prepare("SELECT COUNT(*) AS total FROM media_assets").get() as {
    total: number;
  }).total;

  console.log(`Importación completada desde ${inputPath}.`);
  console.log(
    `Resumen: ${personsTotal} personas, ${familiesTotal} familias, ${mediaTotal} medios.`
  );
} finally {
  sqlite.close();
}
