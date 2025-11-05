-- Initial database setup for STAC Finder
-- This script runs only on first container creation

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create schema for STAC data
CREATE SCHEMA IF NOT EXISTS stac;

-- Grant permissions to stacuser
GRANT ALL PRIVILEGES ON SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stac TO stacuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA stac TO stacuser;

-- Database is ready for use!
-- You can now create tables via pgAdmin or your application
