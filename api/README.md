# STAC API Component

This folder contains the modular implementation of the STAC-compliant API. It provides RESTful endpoints for accessing geospatial collections and items, following the [STAC API specification](https://github.com/radiantearth/stac-api-spec).

## Project Structure

```
api/ 
├── controllers/          # Business logic for each route
├── db/                   # PostgreSQL connection and query helpers  
├── middleware/           # Logging, error handling, etc. 
├── routes/               # Express routers for each endpoint 
├── tests/                # Unit and integration tests
├── utils/                # Helper functions and utilities
│   ├── sorting.js        # Sort parameter parsing and validation
│   ├── pagination.js     # Pagination logic and link generation
│   ├── filtering.js      # Filter parameter validation (q, bbox, datetime, filter)
│   ├── queryBuilder.js   # CQL2 to SQL conversion
│   └── cql2-service.py   # Python service for CQL2 parsing (using cql2 library)
├── .env                  # Environment variables 
├── app.js                # Main Express app entry point 
├── package.json          # Dependencies and scripts
```

## API Features

### Collections Endpoint (`/collections`)

The collections endpoint supports STAC-compliant sorting, pagination and filtering.

#### Sorting (`sortby`)

- **`sortby`**: Sort by field with optional direction prefix (comma-separated for multiple fields)
  - **Allowed fields**: `id`, `title`, `description`, `license`
  - **Direction prefix**: `+` for ascending (default), `-` for descending
  - **Format**: `field`, `+field`, or `-field`

**Examples:**
```
GET /collections?sortby=title          # Sort by title ascending (default)
GET /collections?sortby=+title         # Sort by title ascending (explicit)
GET /collections?sortby=-title         # Sort by title descending
GET /collections?sortby=+title,-id     # Sort by title ascending, then id descending
```

#### Pagination (`limit` and `token`)

- **`limit`**: Maximum number of collections to return per page
  - **Default**: 10
  - **Maximum**: 10000
  - **Format**: Positive integer

- **`token`**: Opaque pagination token for navigating between pages
  - **Format**: Base64-encoded string (automatically generated)
  - **Usage**: Use the `next` and `prev` links in the response to navigate

**Examples:**
```
GET /collections?limit=20              # Get first 20 collections
GET /collections?limit=20&token=xyz    # Get next/previous page using token from links
```

**Response includes pagination links:**
```json
{
  "collections": [...],
  "links": [
    {
      "rel": "self",
      "href": "/collections?limit=20",
      "type": "application/json"
    },
    {
      "rel": "next",
      "href": "/collections?limit=20&token=xyz",
      "type": "application/json"
    }
  ]
}
```

All query parameters are validated against whitelists to prevent SQL injection attacks.

**STAC API Compliance**: This implements the [STAC API Sort Extension](https://github.com/stac-api-extensions/sort) and follows OGC API - Features pagination patterns for HTTP GET requests.

### Collection Details Endpoint (`/collections/{id}`)

Retrieves the full metadata for a specific collection identified by its ID.

- **Path Parameter**: `id` (Integer - The unique identifier of the collection)
- **Response**: Returns the STAC Collection JSON (v1.0.0).

**Example:**
```
GET /collections/123                   # Get collection with ID 123
```

**Response (JSON):**
Returns a standard STAC Collection object including `extent`, `summaries`, and `links`.

### Filtering

The API supports STAC-compliant filtering with multiple query parameters:

#### Text Search (`q`)
- **`q`**: Full-text search across title, description, keywords, ...
- **Status**: Structure prepared in `utils/filtering.js`
- **Planned**: PostgreSQL ILIKE or full-text search (to_tsvector)
### Filtering

The API supports STAC-compliant filtering with multiple query parameters:

#### Free-Text Search (`q`)
- **`q`**: Free-text search across multiple collection fields
- **Search fields**: `title`, `description`, `license`, `keywords`, `providers`
- **Logic**: Case-insensitive ILIKE search with OR logic
- **Multiple terms**: Space-separated terms are treated with OR (matches any term)
- **Max length**: 200 characters

**Examples:**
```
GET /collections?q=sentinel           # Find collections containing "sentinel"
GET /collections?q=sentinel landsat   # Find collections with "sentinel" OR "landsat"
GET /collections?q=sentinel&limit=5   # Combine with pagination
```

**Behavior:**
- Single term: `q=landsat` → Searches all fields for "landsat"
- Multiple terms: `q=sentinel landsat` → Finds collections containing "sentinel" OR "landsat" in any field
- Case-insensitive: `q=Sentinel` matches "sentinel", "SENTINEL", "Sentinel"
- Partial matching: `q=optic` matches "optical", "optics", etc.

#### Bounding Box (`bbox`)
- **`bbox`**: Spatial filter as `minx,miny,maxx,maxy` (WGS84)
- **Status**: Validation implemented in `utils/filtering.js`
- **Planned**: PostGIS ST_Intersects query with spatial_extent column

#### Datetime (`datetime`)
- **`datetime`**: Temporal filter as ISO8601 interval
- **Status**: Structure prepared in `utils/filtering.js`
- **Planned**: Filter using temporal_start and temporal_end columns

#### CQL2 Filter (`filter`, `filter-lang`)
- **`filter`**: Complex queries using CQL2 (Common Query Language)
- **`filter-lang`**: `cql2-text` or `cql2-json`
- **Status**: Integration prepared with Python cql2 library
- **Implementation**: `utils/filtering.js` → `utils/queryBuilder.js` → `utils/cql2-service.py`

**Note**: All filter utilities include input validation and SQL injection protection. Filters can be combined with sorting and pagination parameters.

### Health Endpoint (`/health`)

The health endpoint is used to monitor the operational status of the STACFinder API and its database connection.

#### Purpose

The endpoint allows users, monitoring tools, and the web user interface to quickly check:

- whether the API server is running, and
- whether the database is reachable.

It does not return any STAC data and performs only a lightweight database check.

#### Example Response
```json
{
  "status": "degraded",
  "api": "up",
  "database": "down",
  "target": {
    "host": "host.docker.internal",
    "port": "5432",
    "database": "local_stacfinder"
  },
  "timestamp": "2025-12-15T11:54:14.164Z"
}
```
- **`status`**: Overall sydtem status
  - **`ok`**: API and database are fully operational
  - **`degraded`**: API is running, but the database is not reachable

- **`api`**: Indicates whether the API server is responding (`up`)

- **`database`**: Indicates whether a connection to the database could be established

- **`target`**: Shows which database configuration the health check is currently testing. This is mainly intended for development and debugging

- **`timestamp`**: Time of the health check in UTC (Coordinated Universal Time)

## Development Guidelines

- Each route is defined in `routes/` and linked to a controller in `controllers/`.
- Use `express.Router()` for modular routing.
- Add reusable logic in `utils/`:
  - **Input validation and parsing** → `utils/filtering.js`, `utils/sorting.js`, `utils/pagination.js`
  - **Query building** → `utils/queryBuilder.js`
  - **External services** → `utils/cql2-service.py`
- Use `middleware/` for logging and error handling.
- Keep database logic in `db/index.js`.
- All utilities should return consistent error objects: `{ status, error, message }`

## Testing

The API includes comprehensive unit and integration tests using Jest and Supertest.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
api/tests/
├── unit/                 # Unit tests for utilities
│   ├── sorting.test.js   # Tests for sorting logic
│   └── pagination.test.js # Tests for pagination logic
└── integration/          # Integration tests for endpoints
    └── collections.test.js # Tests for /collections endpoint
```

### Test Coverage

- **Unit Tests**: Test utility functions (sorting, pagination) in isolation
- **Integration Tests**: Test full HTTP endpoints with database interactions
- **Validation Tests**: Ensure proper error handling for invalid inputs

**Note**: Integration tests require a running PostgreSQL database with test data.

## Documentation

- OpenAPI spec will be available at `/docs/api/openapi.json`.
- All endpoints follow the STAC API specification and return STAC-compliant JSON.

## Collaboration

This component is maintained by the STAC API group. It provides data to the Web-UI group and receives input from the Crawler group via the shared PostgreSQL database.