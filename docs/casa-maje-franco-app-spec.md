# Casa Majé Franco

## Especificación base para la construcción de la aplicación del árbol familiar

## 1. Objetivo

Construir una aplicación propia para la casa Majé Franco que permita:

- navegar el árbol familiar de forma clara;
- entender conexiones entre personas, parejas, hijos y ramas;
- almacenar fotos, documentos e historias familiares;
- conservar fuentes, notas y niveles de confianza;
- trabajar en local sin depender de internet;
- crecer desde el JSON actual hacia un sistema más sólido.

La aplicación no debe limitarse a fichas con atributos. Debe combinar genealogía, narrativa familiar y archivo visual.

## 2. Recomendación ejecutiva

### Tecnología recomendada

- `Next.js + React + TypeScript` para la aplicación.
- `SQLite` como fuente de verdad local.
- archivos en disco para fotos y documentos.
- `JSON` solo para importación, exportación y respaldo.
- `Markdown` como formato de contenido para historias, pero almacenado dentro de la base de datos en la primera versión.

### Decisión principal

La mejor base para este proyecto es un enfoque híbrido:

- `SQLite` para personas, familias, eventos, historias, medios, fuentes y relaciones;
- carpeta local de medios para imágenes y documentos;
- importador del archivo [`arbol_franco_cardona_gramps_like.json`](/home/smaje/Documentos/Projects/2026/mf-family-tree/arbol_franco_cardona_gramps_like.json);
- exportación periódica a JSON para respaldo portátil.

### Por qué esta opción es la correcta

El JSON actual ya no es un listado simple: tiene personas, familias, citas, fuentes, medios, lugares, notas y niveles de confianza. Ese tipo de estructura necesita relaciones consistentes y consultas fiables. SQLite resuelve eso mejor que una colección de archivos JSON o Markdown sueltos.

## 3. Evaluación de persistencia

### Opción A: solo archivos JSON

Ventajas:

- fácil de inspeccionar;
- simple para importar/exportar;
- útil como respaldo.

Problemas:

- mantener relaciones complejas se vuelve frágil;
- editar historias, medios y referencias cruzadas crece en dificultad;
- buscar ancestros, descendientes, líneas de parentesco y material relacionado se vuelve más costoso;
- controlar integridad entre personas, familias, medios y fuentes queda a mano.

Conclusión: no usar JSON como almacenamiento principal.

### Opción B: solo archivos Markdown

Ventajas:

- excelente para relatos largos;
- amigable para versionado;
- legible fuera de la app.

Problemas:

- no sirve bien como modelo genealógico principal;
- las relaciones familiares y consultas quedarían dispersas;
- enlazar personas, fechas, fuentes y fotos sería más débil.

Conclusión: útil para narrativa, insuficiente como base de la aplicación.

### Opción C: SQLite local

Ventajas:

- modelo relacional fuerte;
- consultas rápidas;
- permite filtros, búsqueda, timeline y validaciones;
- funciona offline;
- portable como archivo único;
- ideal para una app familiar local-first.

Problemas:

- requiere definir esquema e importadores;
- obliga a una capa mínima de backend.

Conclusión: debe ser la base principal.

### Decisión final

Usar `SQLite` como almacenamiento principal, `media/` para archivos binarios, `JSON` para import/export y `Markdown` para relatos dentro del sistema.

## 4. Lectura del estado actual del JSON

El archivo actual contiene, como mínimo:

- 50 personas;
- 14 familias;
- 1 medio;
- 3 notas generales;
- 1 fuente;
- 1 cita;
- 1 lugar.

Observaciones importantes del dataset actual:

- existen relaciones con `confidence` baja o media;
- varias familias tienen `parent2_id: null`;
- hay fechas heterogéneas, parciales o dudosas;
- hay notas genealógicas que no deben perderse;
- ya existe separación entre personas, familias, fuentes, citas y medios;
- el modelo actual es una excelente base de importación, pero no de edición diaria.

Ejemplos que afectan el diseño:

- la fecha `0/10/1931` no debe romper el sistema; debe guardarse el texto original y una normalización parcial;
- varias uniones son hipótesis estructurales, por lo que la app debe mostrar incertidumbre;
- la relación `familia -> hijos` ya existe y conviene preservarla como entidad propia en vez de conectar personas de forma directa y caótica.

## 5. Arquitectura recomendada

### 5.1 Tipo de aplicación

Aplicación web local-first.

Razones:

- se puede usar desde navegador en el computador principal;
- más adelante puede abrirse a otros dispositivos de la casa en la red local;
- evita el costo inicial de una app móvil nativa;
- permite evolucionar luego a PWA o contenedor de escritorio si hace falta.

### 5.2 Stack recomendado

- `Next.js`
- `TypeScript`
- `SQLite`
- `Drizzle ORM`
- `Zod` para validación de importación
- `React Flow` para interacción del grafo
- `ELK.js` para layout automático del árbol
- `react-markdown` para render de historias
- `Sharp` para miniaturas de imágenes

### 5.3 Patrón de modelado visual

No dibujar solo relaciones `persona -> persona`.

Usar este patrón:

- nodo de persona;
- nodo de familia o unión;
- conexiones `padre/madre -> familia`;
- conexiones `familia -> hijos`.

Eso coincide con tu JSON actual y mejora mucho la legibilidad en familias con múltiples hijos, padres desconocidos o más de una unión.

## 6. Decisiones de producto

### 6.1 Identidad del proyecto

Nombre de trabajo:

`Casa Majé Franco`

Subtítulo sugerido:

`Archivo familiar vivo`

### 6.2 Principios de producto

- local-first;
- legible antes que recargado;
- cada dato importante debe poder citar su fuente;
- cada persona debe poder tener contexto narrativo, no solo campos;
- la incertidumbre histórica debe mostrarse, no ocultarse;
- las fotos y relatos deben sentirse tan centrales como el árbol.

## 7. Módulos funcionales

### 7.1 Inicio

Debe mostrar:

- portada de la casa Majé Franco;
- acceso a ramas familiares;
- búsqueda global;
- historias recientes o destacadas;
- personas recordadas;
- eventos próximos en efemérides.

### 7.2 Vista de árbol

Debe permitir:

- centrar en una persona;
- subir o bajar generaciones;
- cambiar entre ancestros, descendencia y vista mixta;
- ocultar o mostrar ramas;
- distinguir relaciones confirmadas de relaciones dudosas;
- abrir fichas sin perder el contexto visual.

### 7.3 Ficha de persona

Debe incluir:

- nombre principal y alias;
- foto principal;
- nacimiento, muerte y otros eventos;
- padres, parejas, hijos, hermanos;
- historias relacionadas;
- galería de medios;
- notas;
- fuentes y citas;
- nivel de confianza;
- enlaces a personas relacionadas.

### 7.4 Ficha de familia o unión

Debe incluir:

- miembros de la unión;
- hijos;
- tipo de relación;
- notas de contexto;
- lugar asociado;
- historias de la rama;
- medios compartidos.

### 7.5 Historias

Debe permitir:

- escribir relatos largos;
- asociar una historia a una o varias personas;
- insertar fotos;
- etiquetar por rama, época o tema;
- mostrar historias en tarjetas y vista completa.

### 7.6 Galería

Debe manejar:

- fotos por persona;
- fotos familiares;
- documentos escaneados;
- miniaturas;
- pies de foto;
- fecha aproximada;
- fuente del material.

### 7.7 Cronología

Debe mezclar:

- nacimientos;
- fallecimientos;
- uniones;
- migraciones;
- historias destacadas;
- material documental por fecha o rango.

### 7.8 Administración

Debe permitir:

- crear y editar personas;
- crear y editar familias;
- subir imágenes;
- redactar historias;
- revisar conflictos de importación;
- validar relaciones con baja confianza.

## 8. Modelo de datos recomendado

## 8.1 Entidades principales

### `persons`

- `id`
- `external_id`
- `given_name`
- `surname`
- `display_name`
- `alias`
- `gender`
- `is_living`
- `confidence`
- `summary`
- `profile_photo_media_id`
- `created_at`
- `updated_at`

### `families`

- `id`
- `external_id`
- `parent1_id`
- `parent2_id`
- `relationship_type`
- `confidence`
- `notes_markdown`
- `place_id`
- `created_at`
- `updated_at`

### `family_children`

- `family_id`
- `person_id`
- `sort_order`
- `confidence`

### `events`

- `id`
- `person_id`
- `family_id`
- `type`
- `date_original`
- `date_sort_start`
- `date_sort_end`
- `date_precision`
- `is_approximate`
- `place_id`
- `description`

### `stories`

- `id`
- `slug`
- `title`
- `excerpt`
- `content_markdown`
- `cover_media_id`
- `status`
- `created_at`
- `updated_at`

### `story_persons`

- `story_id`
- `person_id`

### `story_families`

- `story_id`
- `family_id`

### `media_assets`

- `id`
- `kind`
- `title`
- `file_path`
- `thumbnail_path`
- `mime_type`
- `caption`
- `date_original`
- `place_id`
- `source_id`
- `created_at`

### `person_media`

- `person_id`
- `media_id`
- `role`
- `sort_order`

### `family_media`

- `family_id`
- `media_id`
- `role`

### `places`

- `id`
- `name`
- `type`
- `latitude`
- `longitude`
- `notes_markdown`

### `sources`

- `id`
- `title`
- `author`
- `abbreviation`
- `publication_info`
- `repository_ref`

### `citations`

- `id`
- `source_id`
- `page`
- `confidence`
- `notes_markdown`

### `entity_citations`

- `citation_id`
- `entity_type`
- `entity_id`

### `notes`

- `id`
- `entity_type`
- `entity_id`
- `content_markdown`
- `visibility`

## 8.2 Campos especiales obligatorios

Para no perder riqueza histórica, el sistema debe soportar:

- alias;
- notas libres;
- citas y fuentes;
- medios por persona y por familia;
- relaciones inciertas;
- fechas parciales;
- texto original importado;
- niveles de confianza.

## 9. Estrategia de historias y fotos

### Fotos

Las imágenes no deben guardarse dentro de SQLite como blob en la primera versión.

Guardar:

- archivo original en `storage/media/originals`;
- miniatura en `storage/media/thumbs`;
- metadatos y relaciones en SQLite.

Razones:

- reduce peso y corrupción potencial de la base;
- simplifica backups;
- mejora rendimiento.

### Historias

Guardar las historias como `Markdown` en un campo de base de datos, por ejemplo `stories.content_markdown`.

Razones:

- permite edición razonablemente simple;
- es portable;
- sigue siendo fácil de renderizar;
- evita que el sistema dependa de cientos de archivos sueltos desde el día uno.

Más adelante, si hace falta, puede migrarse a editor de bloques.

## 10. Importación del JSON actual

## 10.1 El archivo actual será semilla de datos

El archivo [`arbol_franco_cardona_gramps_like.json`](/home/smaje/Documentos/Projects/2026/mf-family-tree/arbol_franco_cardona_gramps_like.json) debe tratarse como:

- dataset inicial;
- respaldo del estado de extracción manual;
- referencia de correspondencia para futuras importaciones.

## 10.2 Reglas de importación

- `persons[]` -> tabla `persons`
- `families[]` -> tabla `families`
- `children_ids` -> tabla pivote `family_children`
- `events` embebidos -> tabla `events`
- `media` -> tabla `media_assets`
- `places` -> tabla `places`
- `sources` -> tabla `sources`
- `citations` -> tabla `citations`
- `notes` generales y notas por entidad -> tabla `notes`

## 10.3 Reglas de calidad de importación

- preservar `id` y `gramps_id` como referencias externas;
- conservar `confidence`;
- copiar `notes` textuales sin reinterpretarlas;
- guardar fecha original siempre;
- intentar normalizar fechas solo cuando sea seguro;
- registrar advertencias de importación cuando una relación sea incompleta;
- no descartar entidades con datos parciales.

## 10.4 Cola de revisión manual

La app debe tener un listado de revisión con:

- fechas inválidas o parciales;
- relaciones con `confidence = low`;
- familias con un progenitor desconocido;
- personas sin foto;
- historias pendientes de redactar.

## 11. Estructura de carpetas recomendada

```text
mf-family-tree/
  app/
  components/
  lib/
  db/
    schema/
    migrations/
  scripts/
    import-gramps-like-json.ts
    export-backup.ts
  storage/
    media/
      originals/
      thumbs/
  docs/
    casa-maje-franco-app-spec.md
  data/
    imports/
      arbol_franco_cardona_gramps_like.json
```

## 12. Hoja de ruta recomendada

### Fase 1: fundación

- crear esquema SQLite;
- crear importador desde el JSON actual;
- montar vista básica de personas y familias;
- mostrar árbol navegable;
- permitir lectura de notas y fuentes.

### Fase 2: memoria familiar

- carga de fotos;
- fichas enriquecidas;
- historias en Markdown;
- galería por persona y por rama.

### Fase 3: calidad y curaduría

- cola de revisión;
- normalización de fechas;
- mejoras de búsqueda;
- filtro por rama, apellido y generación.

### Fase 4: publicación doméstica

- modo lectura para compartir con la familia;
- backups automáticos;
- exportación JSON;
- posible despliegue en red local o versión privada en internet.

## 13. Criterios de aceptación del MVP

- el JSON actual se importa sin perder personas, familias, notas ni niveles de confianza;
- el árbol se puede navegar centrado en cualquier persona;
- una ficha de persona muestra familia, eventos, fotos, notas y fuentes;
- se pueden crear historias y vincularlas a personas o familias;
- las fotos se pueden subir y mostrar con miniaturas;
- el sistema sigue funcionando completamente en local.

## 14. Decisión final cerrada

Para la aplicación de la casa Majé Franco:

- sí se necesita base de datos local;
- la base debe ser `SQLite`;
- `JSON` debe quedar como formato de importación y respaldo;
- `Markdown` debe usarse para relatos, no como almacenamiento principal del árbol;
- la app debe modelar personas y familias como entidades separadas para que las conexiones sean claras;
- el archivo actual debe ser el punto de partida del importador, no el formato final de operación.

## 15. Siguiente paso recomendado

El siguiente entregable técnico debe ser:

`documento de esquema inicial + migraciones SQLite + script de importación del JSON actual`

Ese es el punto correcto para empezar a construir la aplicación sin perder el trabajo ya capturado.
