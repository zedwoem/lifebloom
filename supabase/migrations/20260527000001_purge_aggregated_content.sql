-- Purge deprecated table to reduce database footprint and resolve duplication conflicts
DROP TABLE IF EXISTS aggregated_content CASCADE;
