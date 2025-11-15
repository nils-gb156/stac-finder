-- Initial database setup for STAC Finder
-- This script runs only on first container creation

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create schema for STAC data
CREATE SCHEMA IF NOT EXISTS stac;

-- Create tables
--Note: integrations should be robust to the existence of additional fields.

-- Sources table: basic registry of where collections come from
CREATE TABLE IF NOT EXISTS stac.sources (
    id serial PRIMARY KEY,
    title text,
    url text,
    type varchar(100),
    last_crawled_timestamp timestamptz DEFAULT now() --when was the last time the source got crawled (successfully)?
);

-- Collections table: stores extracted/normalised collection metadata for efficient querying
CREATE TABLE IF NOT EXISTS stac.collections (
    id serial PRIMARY KEY,
    title text,
    description text,
    source_id integer REFERENCES stac.sources(id) ON DELETE SET NULL, --id that refers to the source of the collection
    spatial_extent geometry(Polygon, 4326), 
    temporal_extent timestamptz[temporal_start, temporal_end], --date of the oldest and newest data
    keywords text[], --keywords that describe the data
    providers text[],
    license text,
    doi text[], --Digital Object Identifier of the collection
    platform_summary text[], --for satellite data: summary of the platforms of the data
    constellation_summary text[], --for satellite data: summary of constellations of the satellites (if there are any)
    gsd_summary text[], --for satellite data: summary of the ground sampling distance of the data
    processing_level_summary text[], --for sattelite data: summary of the processing level of the data
    last_crawled_timestamp timestamptz DEFAULT now() --when was the last time this collection got crawled (successfully)?
);

-- optional: table for crawl_logs

-- Grant permissions to stacuser
GRANT ALL PRIVILEGES ON SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA stac TO stacuser;

-- Database is ready for use!
-- You can now create tables via pgAdmin or your application
