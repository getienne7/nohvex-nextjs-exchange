-- Database Initialization Script for NOHVEX Exchange Development
-- This script sets up the initial database configuration for development

-- Connect to the default database
\c nohvex;

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

-- Set timezone
SET timezone = 'UTC';

-- Log successful initialization
SELECT 'Development database initialized successfully for NOHVEX Exchange' as status;