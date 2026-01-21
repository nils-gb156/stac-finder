# Queryables Endpoint

## Overview

The Queryables endpoint provides a JSON Schema description of all fields that can be used for filtering STAC Collections. This follows the STAC API Filter Extension and helps clients discover which properties are available for querying.

**Available Endpoint:**
- `GET /queryables` - Retrieve schema of filterable fields

---

## GET /queryables

Returns a Queryables object describing all fields available for filtering collections.

### Request
```
GET /queryables
```

### Query Parameters

This endpoint does not accept any query parameters.

### Response

Returns a JSON object conforming to the Queryables specification.

**Response Structure:**
```json
{
  "type": "Queryables",
  "title": "Filterbare Felder für STAC-Collections",
  "description": "Diese Ressource beschreibt alle Felder, nach denen in /collections gefiltert werden kann.",
  "properties": {
    "title": {
      "type": "string",
      "title": "Titel",
      "description": "Titel der Collection für Freitextsuche"
    },
    "description": {
      "type": "string",
      "title": "Beschreibung",
      "description": "Beschreibung der Collection für Freitextsuche"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "title": "Schlagworte",
      "description": "Keywords zur thematischen Filterung"
    },
    "license": {
      "type": "string",
      "title": "Lizenz",
      "description": "Lizenz der Daten (z.B. CC-BY-4.0, proprietary)"
    },
    "platform_summary": {
      "type": "array",
      "items": { "type": "string" },
      "title": "Plattformen",
      "description": "Satelliten/Plattformen (z.B. Sentinel-2, Landsat-8)"
    },
    "constellation_summary": {
      "type": "array",
      "items": { "type": "string" },
      "title": "Konstellationen",
      "description": "Satelliten-Konstellationen (z.B. Sentinel, Landsat)"
    },
    "gsd_summary": {
      "type": "array",
      "items": { "type": "string" },
      "title": "Ground Sampling Distance",
      "description": "Bodenauflösung der Daten (z.B. 10m, 30m)"
    },
    "processing_level_summary": {
      "type": "array",
      "items": { "type": "string" },
      "title": "Verarbeitungslevel",
      "description": "Verarbeitungsstufe der Daten (z.B. L1C, L2A)"
    },
    "spatial_extent": {
      "type": "object",
      "title": "Räumliche Ausdehnung",
      "description": "Geografische Bounding Box für räumliche Filterung (GeoJSON Polygon)",
      "properties": {
        "type": { "type": "string" },
        "coordinates": { "type": "array" }
      }
    },
    "temporal_extent": {
      "type": "array",
      "items": { "type": "string", "format": "date-time" },
      "minItems": 2,
      "maxItems": 2,
      "title": "Zeitliche Ausdehnung",
      "description": "Zeitraum der Daten [Start, Ende] für zeitliche Filterung"
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "Queryables" |
| `title` | string | Human-readable title of the queryables schema |
| `description` | string | Description of the queryables resource |
| `properties` | object | Object containing all filterable field definitions |

**Available Queryable Properties:**

| Property | Type | Description | Example Usage |
|----------|------|-------------|---------------|
| `title` | string | Collection title for free-text search | Used with `q` parameter |
| `description` | string | Collection description for free-text search | Used with `q` parameter |
| `keywords` | array[string] | Keywords for thematic filtering | Filter: `keywords LIKE '%sentinel%'` |
| `license` | string | Data license identifier | Filter: `license = 'CC-BY-4.0'` |
| `platform_summary` | array[string] | Satellite/platform names | Filter: `'Sentinel-2A' IN platform_summary` |
| `constellation_summary` | array[string] | Satellite constellations | Filter: `'Sentinel' IN constellation_summary` |
| `gsd_summary` | array[string] | Ground sampling distance values | Filter: `'10m' IN gsd_summary` |
| `processing_level_summary` | array[string] | Data processing levels | Filter: `'L2A' IN processing_level_summary` |
| `spatial_extent` | object | Geographic bounding box (GeoJSON Polygon) | Used with `bbox` parameter |
| `temporal_extent` | array[date-time] | Time range [start, end] | Used with `datetime` parameter |

### Example Retrieve queryables schema

```bash
curl "http://localhost:4000/collections/queryables"
```
Returns the complete queryables schema.

### Error Responses

#### 500 Internal Server Error
Returned when a server error occurs.
```json
{
  "error": "Internal server error"
}
```

---

## Usage with Filter Parameters

The queryables schema describes which fields can be used with the following query parameters on `/collections`:

### Free-text Search (`q`)
Searches across these fields:
- `title`
- `description`

### CQL2 Filtering (`filter`)
All properties listed in the queryables response can be used in CQL2 filter expressions:

**String filters:**
```
filter=license='CC-BY-4.0'
filter=title LIKE '%Sentinel%'
```

**Array filters:**
```
filter='Sentinel-2A' IN platform_summary
filter='L2A' IN processing_level_summary
```

**Spatial filters:**
Via `bbox` parameter (corresponds to `spatial_extent` queryable)

**Temporal filters:**
Via `datetime` parameter (corresponds to `temporal_extent` queryable)

---

## STAC Conformance

This endpoint follows the STAC API Filter Extension specification:

- Returns a Queryables object with `type: "Queryables"`
- Provides JSON Schema definitions for all filterable properties
- Includes property types, titles, and descriptions
- Describes both simple properties (strings) and complex properties (arrays, objects)
- Supports discovery of available filter fields before querying

## Related Documentation

- [Collections](collections.md) - Collections endpoints that use these queryables
- [Free-text search](filtering/free-text-search.md) - Free-text search using title/description
- [CQL2-text Filtering](filtering/cql2-text.md) - Using queryables in CQL2 filters
- [CQL2-json Filtering](filtering/cql2-json.md) - Using queryables in JSON filters
- [Datetime Filtering](filtering/datetime.md) - Temporal filtering details
- [Bounding Box Filtering](filtering/bbox.md) - Spatial filtering details