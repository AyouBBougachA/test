BEGIN;

-- A) Users: add phone number
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS phone_number character varying(30);

-- B) Equipment categories and models
CREATE TABLE IF NOT EXISTS public.equipment_categories (
    category_id serial PRIMARY KEY,
    name character varying(100) NOT NULL UNIQUE,
    created_at timestamp default current_timestamp
);

CREATE TABLE IF NOT EXISTS public.equipment_models (
    model_id serial PRIMARY KEY,
    name character varying(150) NOT NULL UNIQUE,
    created_at timestamp default current_timestamp
);

ALTER TABLE public.equipment
    ADD COLUMN IF NOT EXISTS category_id integer,
    ADD COLUMN IF NOT EXISTS model_id integer,
    ADD COLUMN IF NOT EXISTS meter_unit character varying(50),
    ADD COLUMN IF NOT EXISTS start_meter_value numeric(12,2);

-- Backfill categories/models from legacy free-text columns if present
INSERT INTO public.equipment_categories (name)
SELECT DISTINCT trim(classification)
FROM public.equipment
WHERE classification IS NOT NULL AND trim(classification) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.equipment_models (name)
SELECT DISTINCT trim(model_reference)
FROM public.equipment
WHERE model_reference IS NOT NULL AND trim(model_reference) <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE public.equipment e
SET category_id = c.category_id
FROM public.equipment_categories c
WHERE e.category_id IS NULL
  AND e.classification IS NOT NULL
  AND trim(e.classification) <> ''
  AND c.name = trim(e.classification);

UPDATE public.equipment e
SET model_id = m.model_id
FROM public.equipment_models m
WHERE e.model_id IS NULL
  AND e.model_reference IS NOT NULL
  AND trim(e.model_reference) <> ''
  AND m.name = trim(e.model_reference);

-- Add foreign keys for new category/model references
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_equipment_category_id'
    ) THEN
        ALTER TABLE public.equipment
            ADD CONSTRAINT fk_equipment_category_id
            FOREIGN KEY (category_id) REFERENCES public.equipment_categories(category_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_equipment_model_id'
    ) THEN
        ALTER TABLE public.equipment
            ADD CONSTRAINT fk_equipment_model_id
            FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id);
    END IF;
END $$;

-- C) Meters: enforce one meter per equipment, numeric values, add operation/resulting value
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.meters WHERE equipment_id IS NULL
    ) THEN
        RAISE EXCEPTION 'meters.equipment_id contains NULLs; fix data before enforcing NOT NULL';
    END IF;

    IF EXISTS (
        SELECT equipment_id FROM public.meters
        GROUP BY equipment_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate meters found for equipment_id; fix data before enforcing unique constraint';
    END IF;
END $$;

ALTER TABLE public.meters
    ALTER COLUMN equipment_id SET NOT NULL,
    ALTER COLUMN value TYPE numeric(12,2) USING value::numeric(12,2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_meters_equipment_id'
    ) THEN
        ALTER TABLE public.meters
            ADD CONSTRAINT uk_meters_equipment_id UNIQUE (equipment_id);
    END IF;
END $$;

ALTER TABLE public.meter_logs
    ALTER COLUMN value TYPE numeric(12,2) USING value::numeric(12,2),
    ADD COLUMN IF NOT EXISTS operation character varying(10),
    ADD COLUMN IF NOT EXISTS resulting_value numeric(12,2);

ALTER TABLE public.meter_thresholds
    ALTER COLUMN threshold_value TYPE numeric(12,2) USING threshold_value::numeric(12,2);

-- D) Maintenance: remove maintenance_plans
DROP TABLE IF EXISTS public.maintenance_plans CASCADE;

COMMIT;
