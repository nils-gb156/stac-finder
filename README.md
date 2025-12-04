# STACFinder

A STAC-compliant API for browsing and searching SpatioTemporal Asset Catalogs stored in PostgreSQL/PostGIS.

## Features

- **STAC API Collections Endpoint**: Browse all STAC collections
- **PostgreSQL/PostGIS**: Spatial database for STAC metadata
- **Docker Setup**: Easy deployment with Docker Compose
- **Security**: SQL injection protection through input validation

## Installation & Start

### Prerequisites

1. Clone or download the repository.
2. Make sure [Docker](https://www.docker.com/) is installed.
3. **Configure environment variables:**
   
   The project requires two separate `.env` files with database credentials. Copy the example files and add your passwords:
   
   **API Service** (read-only access):
   ```bash
   cp api/.env.example api/.env
   # Edit api/.env and set DB_PASS
   ```
   
   **Crawler Service** (read/write access):
   ```bash
   cp crawler/.env.example crawler/.env
   # Edit crawler/.env and set DB_PASS
   ```

### Docker

Start the application in the project directory:
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

**Additional notes:**
- The application is accessible at: [http://localhost:4000](http://localhost:4000)
- pgAdmin (Database Management) is accessible at: [http://localhost:5050](http://localhost:5050)
  - See [Database Access Guide](docs/database/database-access.md) for setup instructions
- Development mode with hot-reload is enabled by default in Docker

**Services included:**
- **API Server** - Port 4000
- **PostgreSQL + PostGIS** - Port 5432 on finder.stacindex.org webserver
- **pgAdmin** - Port 5050 (web interface for database management)

## API Usage

### Collections Endpoint

Get all collections:
```
GET http://localhost:4000/collections
```

Sort collections fields (ascending):
```
GET http://localhost:4000/collections?sortby=title
GET http://localhost:4000/collections?sortby=-title
GET http://localhost:4000/collections?sortby=+title,-id
```

Pagination (limit results per page):
```
GET http://localhost:4000/collections?limit=20
```

**Sorting:** `sortby=field` (default ascending), `sortby=+field` (ascending), `sortby=-field` (descending)  
**Available fields:** `id`, `title`, `description`, `license`  
**Pagination:** `limit` parameter (default: 10, max: 10000). Use `next`/`prev` links in response to navigate pages.

For more API details, see [API README](api/README.md).
