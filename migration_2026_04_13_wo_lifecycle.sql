-- Migration: Complete maintenance workflow lifecycle upgrade
-- Date: 2026-04-13
-- Purpose: Full status normalization for claims, work orders, tasks + new planning columns + audit history

BEGIN;

-- ============================================================
-- A) ROLE RENAME: DIRECTION_FINANCE -> FINANCE_MANAGER
-- ============================================================
UPDATE public.roles
SET role_name = 'FINANCE_MANAGER'
WHERE role_name = 'DIRECTION_FINANCE';


-- ============================================================
-- B) CLAIMS STATUS NORMALIZATION
--    OLD: OPEN, QUALIFIED, ASSIGNED, IN_PROGRESS, CLOSED
--    NEW: NEW, QUALIFIED, ASSIGNED, CONVERTED_TO_WORK_ORDER,
--         IN_PROGRESS, RESOLVED, CLOSED, REJECTED
-- ============================================================

-- Drop existing check constraint (it uses NOT VALID so safe to drop)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'claims_status_chk') THEN
        ALTER TABLE public.claims DROP CONSTRAINT claims_status_chk;
    END IF;
END $$;

-- Normalize existing legacy values first
UPDATE public.claims
SET status = CASE
    WHEN status IS NULL OR btrim(status) = ''                         THEN 'NEW'
    WHEN upper(btrim(status)) = 'OPEN'                                THEN 'NEW'
    WHEN upper(btrim(status)) = 'QUALIFIED'                           THEN 'QUALIFIED'
    WHEN upper(btrim(status)) = 'ASSIGNED'                            THEN 'ASSIGNED'
    WHEN upper(btrim(status)) = 'IN_PROGRESS'                         THEN 'IN_PROGRESS'
    WHEN upper(btrim(status)) = 'CLOSED'                              THEN 'CLOSED'
    WHEN upper(btrim(status)) IN ('CONVERTED_TO_WORK_ORDER','CONVERTED') THEN 'CONVERTED_TO_WORK_ORDER'
    WHEN upper(btrim(status)) = 'RESOLVED'                            THEN 'RESOLVED'
    WHEN upper(btrim(status)) IN ('REJECTED','CANCELLED','CANCELED')  THEN 'REJECTED'
    ELSE 'NEW'
END;

-- Also add new columns to claims if not already there
ALTER TABLE public.claims
    ADD COLUMN IF NOT EXISTS resolved_at    timestamp,
    ADD COLUMN IF NOT EXISTS rejected_at    timestamp,
    ADD COLUMN IF NOT EXISTS rejection_notes text,
    ADD COLUMN IF NOT EXISTS linked_wo_id   integer;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'claims_linked_wo_id_fkey') THEN
        ALTER TABLE public.claims
            ADD CONSTRAINT claims_linked_wo_id_fkey
            FOREIGN KEY (linked_wo_id) REFERENCES public.work_orders(wo_id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_claims_linked_wo_id ON public.claims(linked_wo_id);

-- Add new check constraint
ALTER TABLE public.claims
    ADD CONSTRAINT claims_status_chk
    CHECK (status IN ('NEW','QUALIFIED','ASSIGNED','CONVERTED_TO_WORK_ORDER','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'))
    NOT VALID;

-- Normalize claim_status_history similarly
UPDATE public.claim_status_history
SET old_status = CASE
    WHEN old_status IS NULL OR btrim(old_status) = ''                  THEN NULL
    WHEN upper(btrim(old_status)) = 'OPEN'                             THEN 'NEW'
    WHEN upper(btrim(old_status)) IN ('QUALIFIED','ASSIGNED','IN_PROGRESS','CLOSED','RESOLVED','REJECTED') THEN upper(btrim(old_status))
    WHEN upper(btrim(old_status)) IN ('CONVERTED_TO_WORK_ORDER','CONVERTED') THEN 'CONVERTED_TO_WORK_ORDER'
    ELSE NULL
END,
    new_status = CASE
    WHEN new_status IS NULL OR btrim(new_status) = ''                  THEN NULL
    WHEN upper(btrim(new_status)) = 'OPEN'                             THEN 'NEW'
    WHEN upper(btrim(new_status)) IN ('QUALIFIED','ASSIGNED','IN_PROGRESS','CLOSED','RESOLVED','REJECTED') THEN upper(btrim(new_status))
    WHEN upper(btrim(new_status)) IN ('CONVERTED_TO_WORK_ORDER','CONVERTED') THEN 'CONVERTED_TO_WORK_ORDER'
    ELSE NULL
END;


-- ============================================================
-- C) WORK ORDERS STATUS NORMALIZATION & NEW COLUMNS
--    OLD: OPEN, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
--    NEW: CREATED, ASSIGNED, SCHEDULED, IN_PROGRESS, ON_HOLD,
--         COMPLETED, VALIDATED, CLOSED, CANCELLED
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wo_status_chk') THEN
        ALTER TABLE public.work_orders DROP CONSTRAINT wo_status_chk;
    END IF;
END $$;

-- Normalize existing WO statuses
UPDATE public.work_orders
SET status = CASE
    WHEN status IS NULL OR btrim(status) = ''   THEN 'CREATED'
    WHEN upper(btrim(status)) = 'OPEN'          THEN 'CREATED'
    WHEN upper(btrim(status)) = 'IN_PROGRESS'   THEN 'IN_PROGRESS'
    WHEN upper(btrim(status)) = 'ON_HOLD'       THEN 'ON_HOLD'
    WHEN upper(btrim(status)) = 'COMPLETED'     THEN 'COMPLETED'
    WHEN upper(btrim(status)) = 'CANCELLED'     THEN 'CANCELLED'
    WHEN upper(btrim(status)) = 'ASSIGNED'      THEN 'ASSIGNED'
    WHEN upper(btrim(status)) = 'SCHEDULED'     THEN 'SCHEDULED'
    WHEN upper(btrim(status)) = 'VALIDATED'     THEN 'VALIDATED'
    WHEN upper(btrim(status)) = 'CLOSED'        THEN 'CLOSED'
    ELSE 'CREATED'
END;

-- New columns on work_orders
ALTER TABLE public.work_orders
    ADD COLUMN IF NOT EXISTS planned_start       timestamp,
    ADD COLUMN IF NOT EXISTS planned_end         timestamp,
    ADD COLUMN IF NOT EXISTS actual_start        timestamp,
    ADD COLUMN IF NOT EXISTS actual_end          timestamp,
    ADD COLUMN IF NOT EXISTS estimated_duration  numeric(10,2),  -- hours
    ADD COLUMN IF NOT EXISTS actual_duration     numeric(10,2),  -- hours
    ADD COLUMN IF NOT EXISTS validation_notes    text,
    ADD COLUMN IF NOT EXISTS validated_at        timestamp,
    ADD COLUMN IF NOT EXISTS validated_by        character varying(255),
    ADD COLUMN IF NOT EXISTS closed_at           timestamp,
    ADD COLUMN IF NOT EXISTS closed_by           character varying(255),
    ADD COLUMN IF NOT EXISTS cancellation_notes  text;

-- Drop old columns that are renamed (keep if safe to keep for backward compat)
-- scheduled_start/scheduled_end were added in previous migration; rename to planned_start/planned_end
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='scheduled_start') THEN
        UPDATE public.work_orders SET planned_start = scheduled_start WHERE planned_start IS NULL AND scheduled_start IS NOT NULL;
        ALTER TABLE public.work_orders DROP COLUMN scheduled_start;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='scheduled_end') THEN
        UPDATE public.work_orders SET planned_end = scheduled_end WHERE planned_end IS NULL AND scheduled_end IS NOT NULL;
        ALTER TABLE public.work_orders DROP COLUMN scheduled_end;
    END IF;
END $$;

-- Add new check constraint
ALTER TABLE public.work_orders
    ADD CONSTRAINT wo_status_chk
    CHECK (status IN ('CREATED','ASSIGNED','SCHEDULED','IN_PROGRESS','ON_HOLD','COMPLETED','VALIDATED','CLOSED','CANCELLED'))
    NOT VALID;

-- ============================================================
-- D) WORK ORDER STATUS HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.work_order_status_history (
    id          serial PRIMARY KEY,
    wo_id       integer NOT NULL REFERENCES public.work_orders(wo_id) ON DELETE CASCADE,
    old_status  character varying(30),
    new_status  character varying(30) NOT NULL,
    changed_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by  character varying(255),
    note        text
);

CREATE INDEX IF NOT EXISTS idx_wo_status_history_wo_id      ON public.work_order_status_history(wo_id);
CREATE INDEX IF NOT EXISTS idx_wo_status_history_changed_at ON public.work_order_status_history(changed_at);


-- ============================================================
-- E) TASKS ENHANCEMENT
--    OLD status: PENDING, COMPLETED
--    NEW status: TODO, IN_PROGRESS, DONE, BLOCKED, SKIPPED
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_status_chk') THEN
        ALTER TABLE public.tasks DROP CONSTRAINT tasks_status_chk;
    END IF;
END $$;

-- Normalize existing task statuses
UPDATE public.tasks
SET status = CASE
    WHEN status IS NULL OR btrim(status) = ''  THEN 'TODO'
    WHEN upper(btrim(status)) = 'PENDING'      THEN 'TODO'
    WHEN upper(btrim(status)) = 'COMPLETED'    THEN 'DONE'
    WHEN upper(btrim(status)) = 'IN_PROGRESS'  THEN 'IN_PROGRESS'
    WHEN upper(btrim(status)) = 'BLOCKED'      THEN 'BLOCKED'
    WHEN upper(btrim(status)) = 'SKIPPED'      THEN 'SKIPPED'
    WHEN upper(btrim(status)) = 'TODO'         THEN 'TODO'
    WHEN upper(btrim(status)) = 'DONE'         THEN 'DONE'
    ELSE 'TODO'
END;

-- New columns on tasks
ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS title              character varying(255),
    ADD COLUMN IF NOT EXISTS notes             text,
    ADD COLUMN IF NOT EXISTS assigned_to_user_id integer,
    ADD COLUMN IF NOT EXISTS estimated_duration numeric(6,2),  -- hours
    ADD COLUMN IF NOT EXISTS started_at        timestamp,
    ADD COLUMN IF NOT EXISTS skipped_at        timestamp,
    ADD COLUMN IF NOT EXISTS skipped_by        character varying(255),
    ADD COLUMN IF NOT EXISTS blocked_reason    text;

-- Backfill title from description if null
UPDATE public.tasks SET title = left(description, 255) WHERE title IS NULL AND description IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_assigned_to_user') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT fk_tasks_assigned_to_user
            FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(user_id)
            ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_status_chk
    CHECK (status IN ('TODO','IN_PROGRESS','DONE','BLOCKED','SKIPPED'))
    NOT VALID;

-- ============================================================
-- F) INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wo_planned_start        ON public.work_orders(planned_start) WHERE planned_start IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wo_planned_end          ON public.work_orders(planned_end)   WHERE planned_end IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wo_due_date             ON public.work_orders(due_date)       WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wo_assigned_to_user_id  ON public.work_orders(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wo_status               ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_claim_id             ON public.work_orders(claim_id)       WHERE claim_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_wo_id             ON public.tasks(wo_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to       ON public.tasks(assigned_to_user_id)  WHERE assigned_to_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status            ON public.tasks(status);

COMMIT;
