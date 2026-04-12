-- Migration: mydb.sql (current) -> data.sql (target)
-- Target schema follows data.sql and updated monolith mappings.
-- Review all comments marked RISK before running.

BEGIN;

-- Preflight checks: fail fast if bigint values exceed integer range.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE user_id > 2147483647 OR role_id > 2147483647 OR department_id > 2147483647) THEN
        RAISE EXCEPTION 'users has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.roles WHERE role_id > 2147483647) THEN
        RAISE EXCEPTION 'roles has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.departments WHERE department_id > 2147483647) THEN
        RAISE EXCEPTION 'departments has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.equipment WHERE equipment_id > 2147483647 OR department_id > 2147483647) THEN
        RAISE EXCEPTION 'equipment has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.equipment_documents WHERE id > 2147483647 OR equipment_id > 2147483647) THEN
        RAISE EXCEPTION 'equipment_documents has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.equipment_history WHERE id > 2147483647 OR equipment_id > 2147483647) THEN
        RAISE EXCEPTION 'equipment_history has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.audit_logs WHERE id > 2147483647 OR user_id > 2147483647 OR entity_id > 2147483647) THEN
        RAISE EXCEPTION 'audit_logs has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.maintenance_plans WHERE plan_id > 2147483647 OR equipment_id > 2147483647) THEN
        RAISE EXCEPTION 'maintenance_plans has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.meters WHERE meter_id > 2147483647 OR equipment_id > 2147483647) THEN
        RAISE EXCEPTION 'meters has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.meter_logs WHERE log_id > 2147483647 OR meter_id > 2147483647) THEN
        RAISE EXCEPTION 'meter_logs has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
    IF EXISTS (SELECT 1 FROM public.meter_thresholds WHERE id > 2147483647 OR meter_id > 2147483647) THEN
        RAISE EXCEPTION 'meter_thresholds has values > 2,147,483,647; cannot convert bigint -> integer safely';
    END IF;
END $$;

-- Drop foreign keys that depend on columns being altered.
ALTER TABLE IF EXISTS public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.claims DROP CONSTRAINT IF EXISTS claims_requester_id_fkey;
ALTER TABLE IF EXISTS public.work_orders DROP CONSTRAINT IF EXISTS work_orders_technician_id_fkey;
ALTER TABLE IF EXISTS public.work_orders DROP CONSTRAINT IF EXISTS fk_work_orders_validated_by;
ALTER TABLE IF EXISTS public.labor_logs DROP CONSTRAINT IF EXISTS labor_logs_technician_id_fkey;
ALTER TABLE IF EXISTS public.schedules DROP CONSTRAINT IF EXISTS schedules_technician_id_fkey;
ALTER TABLE IF EXISTS public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS public.work_order_status_history DROP CONSTRAINT IF EXISTS work_order_status_history_changed_by_fkey;
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_department_id_fkey;

ALTER TABLE IF EXISTS public.equipment DROP CONSTRAINT IF EXISTS equipment_department_id_fkey;
ALTER TABLE IF EXISTS public.equipment_documents DROP CONSTRAINT IF EXISTS equipment_documents_equipment_id_fkey;
ALTER TABLE IF EXISTS public.equipment_history DROP CONSTRAINT IF EXISTS equipment_history_equipment_id_fkey;
ALTER TABLE IF EXISTS public.equipment_history DROP CONSTRAINT IF EXISTS fk_equipment_history_performed_by;
ALTER TABLE IF EXISTS public.failure_logs DROP CONSTRAINT IF EXISTS failure_logs_equipment_id_fkey;
ALTER TABLE IF EXISTS public.maintenance_plans DROP CONSTRAINT IF EXISTS maintenance_plans_equipment_id_fkey;
ALTER TABLE IF EXISTS public.meters DROP CONSTRAINT IF EXISTS meters_equipment_id_fkey;
ALTER TABLE IF EXISTS public.alerts DROP CONSTRAINT IF EXISTS alerts_equipment_id_fkey;
ALTER TABLE IF EXISTS public.claims DROP CONSTRAINT IF EXISTS claims_equipment_id_fkey;

ALTER TABLE IF EXISTS public.alerts DROP CONSTRAINT IF EXISTS alerts_meter_id_fkey;
ALTER TABLE IF EXISTS public.meter_logs DROP CONSTRAINT IF EXISTS meter_logs_meter_id_fkey;
ALTER TABLE IF EXISTS public.meter_thresholds DROP CONSTRAINT IF EXISTS meter_thresholds_meter_id_fkey;

-- Convert bigint columns to integer (RISK: overflow if preflight checks are bypassed).
ALTER TABLE public.roles ALTER COLUMN role_id TYPE integer USING role_id::integer;
ALTER TABLE public.departments ALTER COLUMN department_id TYPE integer USING department_id::integer;

ALTER TABLE public.users ALTER COLUMN user_id TYPE integer USING user_id::integer;
ALTER TABLE public.users ALTER COLUMN role_id TYPE integer USING role_id::integer;
ALTER TABLE public.users ALTER COLUMN department_id TYPE integer USING department_id::integer;

ALTER TABLE public.audit_logs ALTER COLUMN id TYPE integer USING id::integer;
ALTER TABLE public.audit_logs ALTER COLUMN user_id TYPE integer USING user_id::integer;
ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE integer USING entity_id::integer;

ALTER TABLE public.equipment ALTER COLUMN equipment_id TYPE integer USING equipment_id::integer;
ALTER TABLE public.equipment ALTER COLUMN department_id TYPE integer USING department_id::integer;

ALTER TABLE public.equipment_documents ALTER COLUMN id TYPE integer USING id::integer;
ALTER TABLE public.equipment_documents ALTER COLUMN equipment_id TYPE integer USING equipment_id::integer;

ALTER TABLE public.equipment_history ALTER COLUMN id TYPE integer USING id::integer;
ALTER TABLE public.equipment_history ALTER COLUMN equipment_id TYPE integer USING equipment_id::integer;

ALTER TABLE public.maintenance_plans ALTER COLUMN plan_id TYPE integer USING plan_id::integer;
ALTER TABLE public.maintenance_plans ALTER COLUMN equipment_id TYPE integer USING equipment_id::integer;

ALTER TABLE public.meters ALTER COLUMN meter_id TYPE integer USING meter_id::integer;
ALTER TABLE public.meters ALTER COLUMN equipment_id TYPE integer USING equipment_id::integer;

ALTER TABLE public.meter_logs ALTER COLUMN log_id TYPE integer USING log_id::integer;
ALTER TABLE public.meter_logs ALTER COLUMN meter_id TYPE integer USING meter_id::integer;

ALTER TABLE public.meter_thresholds ALTER COLUMN id TYPE integer USING id::integer;
ALTER TABLE public.meter_thresholds ALTER COLUMN meter_id TYPE integer USING meter_id::integer;

-- Convert equipment_history.performed_by from integer FK to varchar(255).
-- RISK: this removes referential integrity and stores prior user IDs as text.
ALTER TABLE public.equipment_history
    ALTER COLUMN performed_by TYPE character varying(255)
    USING performed_by::character varying(255);

-- Add missing equipment columns from data.sql.
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS manufacturer character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS model_reference character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS classification character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS criticality character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS purchase_date date;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS commissioning_date date;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS supplier_name character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS contract_number character varying(255);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS warranty_end_date date;

-- Add missing equipment_documents columns from data.sql.
ALTER TABLE public.equipment_documents ADD COLUMN IF NOT EXISTS uploaded_at timestamp without time zone;
ALTER TABLE public.equipment_documents ADD COLUMN IF NOT EXISTS uploaded_by character varying(255);

-- Align meter values to integer (RISK: rounding/truncation of fractional values).
ALTER TABLE public.meters
    ALTER COLUMN value TYPE integer
    USING CASE WHEN value IS NULL THEN NULL ELSE ROUND(value)::integer END;

ALTER TABLE public.meter_logs
    ALTER COLUMN value TYPE integer
    USING CASE WHEN value IS NULL THEN NULL ELSE ROUND(value)::integer END;

ALTER TABLE public.meter_thresholds
    ALTER COLUMN threshold_value TYPE integer
    USING CASE WHEN threshold_value IS NULL THEN NULL ELSE ROUND(threshold_value)::integer END;

-- Align column lengths to match data.sql.
-- RISK: values longer than 50 chars will be truncated.
ALTER TABLE public.maintenance_plans
    ALTER COLUMN interval_unit TYPE character varying(50)
    USING CASE WHEN interval_unit IS NULL THEN NULL ELSE LEFT(interval_unit, 50) END;

ALTER TABLE public.meters
    ALTER COLUMN unit TYPE character varying(50)
    USING CASE WHEN unit IS NULL THEN NULL ELSE LEFT(unit, 50) END;

-- Recreate foreign keys with integer types.
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);
ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT fk_work_orders_validated_by FOREIGN KEY (validated_by) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);
ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT equipment_history_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);
ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);
ALTER TABLE ONLY public.meter_logs
    ADD CONSTRAINT meter_logs_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);
ALTER TABLE ONLY public.meter_thresholds
    ADD CONSTRAINT meter_thresholds_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);

-- Reset sequences after type conversions to keep future inserts safe.
SELECT setval('public.users_user_id_seq', COALESCE(MAX(user_id), 1), MAX(user_id) IS NOT NULL) FROM public.users;
SELECT setval('public.roles_role_id_seq', COALESCE(MAX(role_id), 1), MAX(role_id) IS NOT NULL) FROM public.roles;
SELECT setval('public.departments_department_id_seq', COALESCE(MAX(department_id), 1), MAX(department_id) IS NOT NULL) FROM public.departments;
SELECT setval('public.audit_logs_id_seq', COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public.audit_logs;
SELECT setval('public.equipment_equipment_id_seq', COALESCE(MAX(equipment_id), 1), MAX(equipment_id) IS NOT NULL) FROM public.equipment;
SELECT setval('public.equipment_documents_id_seq', COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public.equipment_documents;
SELECT setval('public.equipment_history_id_seq', COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public.equipment_history;
SELECT setval('public.meters_meter_id_seq', COALESCE(MAX(meter_id), 1), MAX(meter_id) IS NOT NULL) FROM public.meters;
SELECT setval('public.meter_logs_log_id_seq', COALESCE(MAX(log_id), 1), MAX(log_id) IS NOT NULL) FROM public.meter_logs;
SELECT setval('public.meter_thresholds_id_seq', COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public.meter_thresholds;
SELECT setval('public.maintenance_plans_plan_id_seq', COALESCE(MAX(plan_id), 1), MAX(plan_id) IS NOT NULL) FROM public.maintenance_plans;

-- Optional cleanup: drop unused enum types created in mydb.sql if they are not referenced anywhere.
-- DROP TYPE IF EXISTS public.equipment_status;
-- DROP TYPE IF EXISTS public.equipmentstatus;

COMMIT;
