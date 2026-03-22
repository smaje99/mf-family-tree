import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const persons = sqliteTable(
  "persons",
  {
    id: text("id").primaryKey(),
    externalId: text("external_id"),
    givenName: text("given_name"),
    surname: text("surname"),
    displayName: text("display_name").notNull(),
    alias: text("alias"),
    gender: text("gender"),
    isLiving: integer("is_living").notNull().default(0),
    summary: text("summary"),
    profilePhotoMediaId: text("profile_photo_media_id"),
    rawJson: text("raw_json"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => ({
    displayNameIdx: index("persons_display_name_idx").on(table.displayName)
  })
);

export const families = sqliteTable(
  "families",
  {
    id: text("id").primaryKey(),
    externalId: text("external_id"),
    parent1Id: text("parent1_id"),
    parent2Id: text("parent2_id"),
    relationshipType: text("relationship_type"),
    notesMarkdown: text("notes_markdown"),
    placeId: text("place_id"),
    rawJson: text("raw_json"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => ({
    parent1Idx: index("families_parent1_idx").on(table.parent1Id),
    parent2Idx: index("families_parent2_idx").on(table.parent2Id)
  })
);

export const familyChildren = sqliteTable(
  "family_children",
  {
    familyId: text("family_id").notNull(),
    personId: text("person_id").notNull(),
    sortOrder: integer("sort_order")
  },
  (table) => ({
    pk: primaryKey({ columns: [table.familyId, table.personId] })
  })
);

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    personId: text("person_id"),
    familyId: text("family_id"),
    type: text("type").notNull(),
    dateOriginal: text("date_original"),
    dateSortStart: text("date_sort_start"),
    dateSortEnd: text("date_sort_end"),
    datePrecision: text("date_precision"),
    isApproximate: integer("is_approximate").notNull().default(0),
    placeId: text("place_id"),
    description: text("description"),
    rawJson: text("raw_json")
  },
  (table) => ({
    personIdx: index("events_person_idx").on(table.personId),
    familyIdx: index("events_family_idx").on(table.familyId)
  })
);

export const stories = sqliteTable("stories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  contentMarkdown: text("content_markdown").notNull(),
  coverMediaId: text("cover_media_id"),
  status: text("status").notNull().default("draft"),
  rawJson: text("raw_json"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const storyPersons = sqliteTable(
  "story_persons",
  {
    storyId: text("story_id").notNull(),
    personId: text("person_id").notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.storyId, table.personId] })
  })
);

export const storyFamilies = sqliteTable(
  "story_families",
  {
    storyId: text("story_id").notNull(),
    familyId: text("family_id").notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.storyId, table.familyId] })
  })
);

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  filePath: text("file_path"),
  thumbnailPath: text("thumbnail_path"),
  mimeType: text("mime_type"),
  caption: text("caption"),
  dateOriginal: text("date_original"),
  placeId: text("place_id"),
  sourceId: text("source_id"),
  rawJson: text("raw_json"),
  createdAt: text("created_at").notNull()
});

export const personMedia = sqliteTable(
  "person_media",
  {
    personId: text("person_id").notNull(),
    mediaId: text("media_id").notNull(),
    role: text("role"),
    sortOrder: integer("sort_order")
  },
  (table) => ({
    pk: primaryKey({ columns: [table.personId, table.mediaId] })
  })
);

export const familyMedia = sqliteTable(
  "family_media",
  {
    familyId: text("family_id").notNull(),
    mediaId: text("media_id").notNull(),
    role: text("role")
  },
  (table) => ({
    pk: primaryKey({ columns: [table.familyId, table.mediaId] })
  })
);

export const places = sqliteTable("places", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  notesMarkdown: text("notes_markdown"),
  rawJson: text("raw_json")
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  abbreviation: text("abbreviation"),
  publicationInfo: text("publication_info"),
  repositoryRef: text("repository_ref"),
  rawJson: text("raw_json")
});

export const citations = sqliteTable("citations", {
  id: text("id").primaryKey(),
  sourceId: text("source_id"),
  page: text("page"),
  notesMarkdown: text("notes_markdown"),
  rawJson: text("raw_json")
});

export const entityCitations = sqliteTable(
  "entity_citations",
  {
    citationId: text("citation_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.citationId, table.entityType, table.entityId] })
  })
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    visibility: text("visibility").notNull().default("private"),
    rawJson: text("raw_json")
  },
  (table) => ({
    entityIdx: index("notes_entity_idx").on(table.entityType, table.entityId)
  })
);

export const schemaMigrations = sqliteTable("schema_migrations", {
  id: text("id").primaryKey(),
  appliedAt: text("applied_at").notNull()
});
