# STACFinder

A STAC-compliant API for browsing and searching SpatioTemporal Asset Catalogs stored in PostgreSQL/PostGIS.

## Features

- **STAC API Collections Endpoint**: Browse all STAC collections
- **Content Negotiation**: Returns HTML for browsers, JSON for API clients
- **PostgreSQL/PostGIS**: Spatial database for STAC metadata
- **Docker Setup**: Easy deployment with Docker Compose

## Installation & Start

### Prerequisites

1. Clone or download the repository.
2. Make sure [Docker](https://www.docker.com/) is installed.
3. **Configure environment variables:**
   
   The project requires two separate `.env` files with database credentials:
   
   **API Service**:
   
   Create `/api/.env` and set the API user credentials (read-only access):
   ```
   DB_HOST=finder.stacindex.org
   DB_PORT=5432
   DB_USER=stacapi
   DB_PASS=(enter known password)
   DB_NAME=stacfinder
   ```
   
   **Crawler Service**:

   Create `crawler/.env` and set the crawler user credentials (read/write access):
   ```
   DB_HOST=finder.stacindex.org
   DB_PORT=5432
   DB_USER=crawler
   DB_PASS=(enter known password)
   DB_NAME=stacfinder
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
- **PostgreSQL + PostGIS** - Port 5433 (external), stores spatial STAC data
- **pgAdmin** - Port 5050 (web interface for database management)

## API Endpoints

### GET `/collections`

Returns all STAC collections from the database. Supports content negotiation via Accept header and query parameters.

**Parameters:**
- `f` (optional): Output format
  - `json` - JSON response (default for API clients)
  - `html` - HTML page (default for browsers)

**Examples:**
```bash
# Browser (HTML)
http://localhost:4000/collections

# JSON for API clients
http://localhost:4000/collections?f=json

# HTML explicitly
http://localhost:4000/collections?f=html
```
