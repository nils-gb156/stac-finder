# STACFinder

A STAC-compliant API for browsing and searching SpatioTemporal Asset Catalogs stored in PostgreSQL/PostGIS.

## Features

- **STAC API Collections Endpoint**: Browse all STAC collections
- **Content Negotiation**: Returns HTML for browsers, JSON for API clients
- **PostgreSQL/PostGIS**: Spatial database for STAC metadata
- **Docker Setup**: Easy deployment with Docker Compose

## Installation & Start

### Docker

1. Clone or download the repository.
2. Make sure [Docker](https://www.docker.com/) is installed.
3. Start the application in the project directory:
  - **First start (build container):**
    ```bash
    docker-compose up --build
    ```
  - **Subsequent starts:**
    ```bash
    docker-compose up -d
    ```
4. Stop the application:
  ```bash
  docker-compose down
  ```
5. **Database access:** See [Database Access Guide](docs/database-access.md) for details on connecting to PostgreSQL

**Additional notes:**
- The application is accessible at: [http://localhost:4000](http://localhost:4000)
- pgAdmin (Database Management) is accessible at: [http://localhost:5050](http://localhost:5050)
  - Login: `admin@admin.com` / `admin`
  - See [Database Access Guide](docs/database/database-access.md) for setup instructions
- Development mode with hot-reload is enabled by default in Docker

**Services included:**
- **API Server** - Port 4000
- **PostgreSQL + PostGIS** - Port 5433 (external), stores spatial STAC data
- **pgAdmin** - Port 5050 (web interface for database management)

## API Endpoints

### GET `/collections`

Returns all STAC collections from the database as JSON. Supports CQL2 filtering for advanced queries.

**Parameters:**
- `filter` (optional): CQL2 filter expression for filtering collections
  - Supports attribute, temporal, and spatial filters
  - Follows the [CQL2 specification](https://docs.ogc.org/DRAFTS/21-065.html)

**Examples:**
```bash
# All collections
http://localhost:4000/collections

# Simple filter by ID
http://localhost:4000/collections?filter=id=2

# Temporal filter
http://localhost:4000/collections?filter=temporal_start>='2023-01-01T00:00:00Z'

# Spatial filter (PostGIS)
http://localhost:4000/collections?filter=intersects(spatial_extent,POLYGON((0 0,10 0,10 10,0 10,0 0)))

# Combined filters with AND/OR
http://localhost:4000/collections?filter=id=2 AND temporal_start>='2023-01-01'
```
