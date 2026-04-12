-- Normalize legacy equipment.status values to current enum vocabulary.
-- Mapping:
--   active -> OPERATIONAL
--   maintenance -> UNDER_REPAIR
--   inactive -> ARCHIVED

BEGIN;

-- 1) Report any unexpected equipment.status values (not legacy and not current).
SELECT status, COUNT(*) AS row_count
FROM public.equipment
WHERE status IS NOT NULL
  AND lower(status) NOT IN ('active', 'maintenance', 'inactive', 'operational', 'under_repair', 'archived')
GROUP BY status
ORDER BY status;

-- 2) Report legacy status vocabulary usage across any public tables with a "status" column.
CREATE TEMP TABLE status_legacy_hits (
    table_name text NOT NULL,
    status_value text NOT NULL,
    row_count bigint NOT NULL
);

DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'status'
    LOOP
        EXECUTE format(
            'INSERT INTO status_legacy_hits(table_name, status_value, row_count)
             SELECT %L, status::text, COUNT(*)
             FROM %I.%I
             WHERE status IS NOT NULL AND lower(status::text) IN (''active'', ''maintenance'', ''inactive'')
             GROUP BY status',
            r.table_name,
            'public',
            r.table_name
        );
    END LOOP;
END $$;

SELECT *
FROM status_legacy_hits
ORDER BY table_name, status_value;

-- 3) Normalize equipment.status values (idempotent) and capture changed rows.
CREATE TEMP TABLE equipment_status_updates (
    equipment_id integer NOT NULL,
    status text NOT NULL
);

WITH updated AS (
    UPDATE public.equipment
    SET status = CASE lower(status)
        WHEN 'active' THEN 'OPERATIONAL'
        WHEN 'maintenance' THEN 'UNDER_REPAIR'
        WHEN 'inactive' THEN 'ARCHIVED'
        ELSE status
    END
    WHERE status IS NOT NULL
      AND lower(status) IN ('active', 'maintenance', 'inactive')
    RETURNING equipment_id, status
)
INSERT INTO equipment_status_updates (equipment_id, status)
SELECT equipment_id, status::text
FROM updated;

SELECT COUNT(*) AS rows_updated FROM equipment_status_updates;

SELECT *
FROM equipment_status_updates
ORDER BY equipment_id;

COMMIT;
