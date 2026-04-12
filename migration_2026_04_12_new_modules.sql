BEGIN;

-- 1. Remove Site-related structures
ALTER TABLE public.departments DROP COLUMN IF EXISTS site_id;
ALTER TABLE public.claims DROP COLUMN IF EXISTS site_id;
DROP TABLE IF EXISTS public.sites CASCADE;

-- 2. Work Orders
CREATE TABLE IF NOT EXISTS public.work_orders (
    wo_id serial PRIMARY KEY,
    claim_id integer REFERENCES public.claims(claim_id),
    equipment_id integer REFERENCES public.equipment(equipment_id) NOT NULL,
    wo_type character varying(50) NOT NULL, -- CORRECTIVE, PREVENTIVE, PREDICTIVE, REGULATORY
    priority character varying(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    status character varying(30) NOT NULL, -- OPEN, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
    title character varying(255) NOT NULL,
    description text,
    assigned_to_user_id integer REFERENCES public.users(user_id),
    estimated_time_hours numeric(10,2),
    actual_time_hours numeric(10,2),
    estimated_cost numeric(12,2),
    actual_cost numeric(12,2),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    due_date timestamp,
    completed_at timestamp,
    completion_notes text,
    is_archived boolean default false
);

-- 3. Tasks (Steps within a VO or general templates)
CREATE TABLE IF NOT EXISTS public.tasks (
    task_id serial PRIMARY KEY,
    wo_id integer REFERENCES public.work_orders(wo_id),
    description text NOT NULL,
    status character varying(20) default 'PENDING', -- PENDING, COMPLETED
    completed_at timestamp,
    completed_by character varying(150),
    order_index integer NOT NULL default 0
);

-- 4. Spare Parts (Inventory)
CREATE TABLE IF NOT EXISTS public.spare_parts (
    part_id serial PRIMARY KEY,
    name character varying(255) NOT NULL,
    sku character varying(100) UNIQUE,
    category character varying(100),
    quantity_in_stock integer NOT NULL default 0,
    min_stock_level integer NOT NULL default 0,
    unit_cost numeric(12,2),
    location character varying(255),
    supplier character varying(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    is_archived boolean default false
);

-- 5. Part Usage (Tracking consumption)
CREATE TABLE IF NOT EXISTS public.part_usage (
    usage_id serial PRIMARY KEY,
    wo_id integer REFERENCES public.work_orders(wo_id) NOT NULL,
    part_id integer REFERENCES public.spare_parts(part_id) NOT NULL,
    quantity_used integer NOT NULL,
    unit_cost_at_usage numeric(12,2),
    used_at timestamp default current_timestamp
);

-- 6. Maintenance Plans (Scheduling)
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    plan_id serial PRIMARY KEY,
    equipment_id integer REFERENCES public.equipment(equipment_id) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    frequency_type character varying(20) NOT NULL, -- DAYS, WEEKS, MONTHS, METER
    frequency_value integer NOT NULL,
    last_generation_date timestamp,
    next_due_date timestamp,
    is_active boolean default true,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

COMMIT;
