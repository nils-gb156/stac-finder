# Queryables Endpoint

## Overview

The `/collections/queryables` endpoint provides a JSON Schema describing all fields that can be used to filter STAC Collections. This follows the STAC API Collection Search Extension and allows clients to discover which properties are available for querying, including dynamic enum values directly sourced from the database.

**Endpoint:**
- `GET /collections/queryables` — Returns the schema of filterable fields

---

## GET /collections/queryables

Returns a Queryables object describing all fields available for filtering collections. Enum values for `platform`, `processingLevel`, `constellation`, `gsd`, and `provider` are dynamically derived from the database and always reflect the current data.

### Request

```
GET /collections/queryables
```

### Query Parameters

This endpoint does not accept any query parameters.

### Response

Returns a JSON object conforming to the Queryables specification. The response includes all filterable properties, their types, and—where applicable—dynamic enum values.

**Queryable Properties:**

| Property           | Type           | Description                                         | Example Usage                                 | Enum Values           |
|--------------------|----------------|-----------------------------------------------------|------------------------------------------------|-----------------------|
| `title`            | string         | Collection title for free-text search                | Used with `q` parameter                        | -                     |
| `description`      | string         | Collection description for free-text search          | Used with `q` parameter                        | -                     |
| `license`          | string         | Data license identifier                             | `license = 'CC-BY-4.0'`                        | -                     |
| `doi`              | string         | Digital Object Identifier                           | `doi = '10.1234/abc'`                          | -                     |
| `platform`         | string         | Platform name (dynamic, from DB)                    | `platform = 'Sentinel-2A'`                     | Dynamic from DB        |
| `processingLevel`  | string         | Processing level (dynamic, from DB)                 | `processingLevel = 'L2A'`                      | Dynamic from DB        |
| `gsd`              | number         | Ground Sampling Distance (dynamic, from DB, numeric)| `gsd = 10`                                     | Dynamic from DB        |
| `provider`         | string         | Data provider name (dynamic, from DB)               | `provider = 'DLR'`                             | Dynamic from DB        |
| `constellation`     | string         | Satellitenkonstellation (dynamic, from DB)          | `constellation = 'sentinel-2'`                 | Dynamic from DB        |
| `temporal_start`   | string (date-time) | Start of temporal extent                        | `temporal_start >= '2020-01-01T00:00:00Z'`     | -                     |
| `temporal_end`     | string (date-time) | End of temporal extent (nullable)               | `temporal_end <= '2022-12-31T23:59:59Z'`       | -                     |
| `spatial_extent`   | geometry-any   | Geometry for spatial filtering                      | Used with `bbox` parameter                      | -                     |

### Example: Retrieve Queryables Schema

```bash
curl "http://localhost:4000/collections/queryables"
```
Returns the complete queryables schema as JSON.

### Error Responses

#### 500 Internal Server Error
Returned when a server error occurs.
```json
{
  "error": "Internal server error"
}
```

---

## Using Queryables for Filtering

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

**Spatial filters:**
Use the `bbox` parameter (corresponds to `spatial_extent` queryable).

**Temporal filters:**
Use the `datetime` parameter (corresponds to `temporal_start` and `temporal_end` queryables).

---

## Dynamic Enum Values

The fields `platform`, `processingLevel`, `constellation`, `gsd`, and `provider` have their possible values (enums) dynamically derived from the current database content. This ensures that filter options always reflect the available data. The API response and JSON Schema are updated accordingly.

## OGC Conformance

This endpoint is designed to be compliant with OGC API standards for feature filtering and queryable properties:

- Returns a Queryables object with `type: "object"`
- Provides JSON Schema definitions for all filterable properties
- Includes dynamic enum values for relevant fields (sourced from the database)
- Describes both simple (string, number) and complex (object, geometry) properties
- Enables discovery of all available filter fields before querying
