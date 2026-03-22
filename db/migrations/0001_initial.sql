CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  given_name TEXT,
  surname TEXT,
  display_name TEXT NOT NULL,
  alias TEXT,
  gender TEXT,
  is_living INTEGER NOT NULL DEFAULT 0,
  confidence TEXT,
  summary TEXT,
  profile_photo_media_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS persons_display_name_idx ON persons (display_name);

CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  parent1_id TEXT,
  parent2_id TEXT,
  relationship_type TEXT,
  confidence TEXT,
  notes_markdown TEXT,
  place_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS families_parent1_idx ON families (parent1_id);
CREATE INDEX IF NOT EXISTS families_parent2_idx ON families (parent2_id);

CREATE TABLE IF NOT EXISTS family_children (
  family_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  sort_order INTEGER,
  confidence TEXT,
  PRIMARY KEY (family_id, person_id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  person_id TEXT,
  family_id TEXT,
  type TEXT NOT NULL,
  date_original TEXT,
  date_sort_start TEXT,
  date_sort_end TEXT,
  date_precision TEXT,
  is_approximate INTEGER NOT NULL DEFAULT 0,
  place_id TEXT,
  description TEXT,
  raw_json TEXT
);

CREATE INDEX IF NOT EXISTS events_person_idx ON events (person_id);
CREATE INDEX IF NOT EXISTS events_family_idx ON events (family_id);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  cover_media_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS story_persons (
  story_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (story_id, person_id)
);

CREATE TABLE IF NOT EXISTS story_families (
  story_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  PRIMARY KEY (story_id, family_id)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT,
  thumbnail_path TEXT,
  mime_type TEXT,
  caption TEXT,
  date_original TEXT,
  place_id TEXT,
  source_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS person_media (
  person_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  role TEXT,
  sort_order INTEGER,
  PRIMARY KEY (person_id, media_id)
);

CREATE TABLE IF NOT EXISTS family_media (
  family_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  role TEXT,
  PRIMARY KEY (family_id, media_id)
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  latitude TEXT,
  longitude TEXT,
  notes_markdown TEXT,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  abbreviation TEXT,
  publication_info TEXT,
  repository_ref TEXT,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  page TEXT,
  confidence TEXT,
  notes_markdown TEXT,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS entity_citations (
  citation_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  PRIMARY KEY (citation_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private',
  raw_json TEXT
);

CREATE INDEX IF NOT EXISTS notes_entity_idx ON notes (entity_type, entity_id);
