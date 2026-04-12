BEGIN;

-- Drop dependent tables first
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.failure_logs CASCADE;
DROP TABLE IF EXISTS public.labor_logs CASCADE;
DROP TABLE IF EXISTS public.maintenance_costs CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.work_order_parts CASCADE;
DROP TABLE IF EXISTS public.work_order_status_history CASCADE;
DROP TABLE IF EXISTS public.work_order_tasks CASCADE;
DROP TABLE IF EXISTS public.task_steps CASCADE;
DROP TABLE IF EXISTS public.part_movements CASCADE;
DROP TABLE IF EXISTS public.parts CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.maintenance_plans CASCADE;
DROP TABLE IF EXISTS public.part_usage CASCADE;
DROP TABLE IF EXISTS public.spare_parts CASCADE;

COMMIT;
