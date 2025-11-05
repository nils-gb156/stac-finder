-- Initial database setup for STAC Finder
-- This script runs only on first container creation

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create schema for STAC data
CREATE SCHEMA IF NOT EXISTS stac;

-- Create tables

-- Note: The table design is preliminary. Crawlers or migration scripts may extend or modify the schema later, 
-- therefore integrations should be robust to the existence of additional fields.

-- Sources table: basic registry of where collections come from
CREATE TABLE IF NOT EXISTS stac.sources (
    id serial PRIMARY KEY,
    title varchar(255) NOT NULL,
    url text,
    type varchar(100),
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

-- Collections table: stores extracted/normalised collection metadata for efficient querying
CREATE TABLE IF NOT EXISTS stac.collections (
    id serial PRIMARY KEY,
    title text,
    description text,
    source_id integer REFERENCES stac.sources(id) ON DELETE SET NULL,
    bbox double precision[],
    spatial_extent geometry(Polygon, 4326),
    temporal_start timestamptz,
    temporal_end timestamptz,
    keywords text[],
    provider_names text[],
    license text,
    dois text[],
    created_at timestamptz DEFAULT now()
);

-- optional: table for crawl_logs

-- Grant permissions to stacuser
GRANT ALL PRIVILEGES ON SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA stac TO stacuser;

-- Database is ready for use!
-- You can now create tables via pgAdmin or your application
