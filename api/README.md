# STAC API Component

This folder contains the modular implementation of the STAC-compliant API. It provides RESTful endpoints for accessing geospatial collections and items, following the [STAC API specification](https://github.com/radiantearth/stac-api-spec).

## Project Structure

```
api/ 
├── controllers/          # Business logic for each route 
├── routes/               # Express routers for each endpoint 
├── middleware/           # Logging, error handling, etc. 
├── db/                   # PostgreSQL connection and query helpers 
├── utils/                # Helper functions (e.g. CQL2 parser) 
├── tests/                # Unit and integration tests
├── app.js                # Main Express app entry point 
├── .env                  # Environment variables 
├── package.json          # Dependencies and scripts
```

## API Features

### Collections Endpoint (`/collections`)

The collections endpoint supports STAC-compliant sorting and pagination.

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

## Development Guidelines

- Each route is defined in `routes/` and linked to a controller in `controllers/`.
- Use `express.Router()` for modular routing.
- Add reusable logic (e.g. CQL2 parsing) in `utils/`.
- Use `middleware/` for logging and error handling.
- Keep database logic in `db/index.js`.

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

Please follow modular design, write clean code, and document your changes clearly.