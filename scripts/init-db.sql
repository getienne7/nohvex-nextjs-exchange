-- Database Initialization Script for NOHVEX Exchange Production
-- This script sets up the initial database configuration

-- Create database if it doesn't exist (PostgreSQL extension)
SELECT 'CREATE DATABASE nohvex_production' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nohvex_production');

-- Connect to the database
\c nohvex_production;

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Set default permissions
GRANT ALL ON SCHEMA public TO nohvex;
GRANT ALL ON ALL TABLES IN SCHEMA public TO nohvex;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO nohvex;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO nohvex;

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database user with appropriate permissions (if needed)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'nohvex') THEN
      CREATE USER nohvex WITH PASSWORD 'default_password';
   END IF;
END
$$;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE nohvex_production TO nohvex;
ALTER USER nohvex CREATEDB;

-- Set timezone
SET timezone = 'UTC';

-- Log successful initialization
SELECT 'Database initialized successfully for NOHVEX Exchange' as status;