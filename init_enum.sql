DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_status') THEN
        CREATE TYPE equipment_status AS ENUM ('OPERATIONAL', 'UNDER_REPAIR', 'ARCHIVED');
    END IF;
END
$$;
