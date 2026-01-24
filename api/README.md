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
├── .env                  # Environment variables 
├── app.js                # Main Express app entry point 
└── package.json          # Dependencies and scripts
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

## API Endpoints

The API provides the following STAC-compliant endpoints:

- **`GET /`** - Landing page
- **`GET /conformance`** - Conformance classes
- **`GET /collections`** - List all collections (with filtering, sorting, pagination)
- **`GET /collections/{id}`** - Get collection by ID
- **`GET /collections/queryables`** - List queryable fields for collections
- **`GET /openapi.json`** - OpenAPI 3.0 specification
- **`GET /health`** - Health check endpoint

For detailed API documentation, see:
- [Collections API](../docs/api/collections.md)
- [Health Endpoint](../docs/api/health.md)
- [Query Parameters](../docs/api/query-param/)
- [Queryables](../docs/api/queryables.md/)
- [Logging](../docs/api/logging.md)

## Development Guidelines

- Each route is defined in `routes/` and linked to a controller in `controllers/`
- Use `express.Router()` for modular routing
- Add reusable logic in `utils/` (validation, parsing, query building)
- Use `middleware/` for logging and error handling
- Keep database logic in `db/index.js`
- All utilities should return consistent error objects: `{ status, error, message }`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Tests are organized in `tests/unit/` and `tests/integration/`. Integration tests require a running PostgreSQL database.