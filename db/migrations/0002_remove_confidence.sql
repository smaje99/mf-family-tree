PRAGMA foreign_keys = OFF;

CREATE TABLE persons__new (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  given_name TEXT,
  surname TEXT,
  display_name TEXT NOT NULL,
  alias TEXT,
  gender TEXT,
  is_living INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  profile_photo_media_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO persons__new (
  id, external_id, given_name, surname, display_name, alias, gender,
  is_living, summary, profile_photo_media_id, raw_json, created_at, updated_at
)
SELECT
  id, external_id, given_name, surname, display_name, alias, gender,
  is_living, summary, profile_photo_media_id, raw_json, created_at, updated_at
FROM persons;

DROP TABLE persons;
ALTER TABLE persons__new RENAME TO persons;
CREATE INDEX persons_display_name_idx ON persons (display_name);

CREATE TABLE families__new (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  parent1_id TEXT,
  parent2_id TEXT,
  relationship_type TEXT,
  notes_markdown TEXT,
  place_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO families__new (
  id, external_id, parent1_id, parent2_id, relationship_type,
  notes_markdown, place_id, raw_json, created_at, updated_at
)
SELECT
  id, external_id, parent1_id, parent2_id, relationship_type,
  notes_markdown, place_id, raw_json, created_at, updated_at
FROM families;

DROP TABLE families;
ALTER TABLE families__new RENAME TO families;
CREATE INDEX families_parent1_idx ON families (parent1_id);
CREATE INDEX families_parent2_idx ON families (parent2_id);

CREATE TABLE family_children__new (
  family_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  sort_order INTEGER,
  PRIMARY KEY (family_id, person_id)
);

INSERT INTO family_children__new (family_id, person_id, sort_order)
SELECT family_id, person_id, sort_order
FROM family_children;

DROP TABLE family_children;
ALTER TABLE family_children__new RENAME TO family_children;

CREATE TABLE citations__new (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  page TEXT,
  notes_markdown TEXT,
  raw_json TEXT
);

INSERT INTO citations__new (id, source_id, page, notes_markdown, raw_json)
SELECT id, source_id, page, notes_markdown, raw_json
FROM citations;

DROP TABLE citations;
ALTER TABLE citations__new RENAME TO citations;

PRAGMA foreign_keys = ON;
