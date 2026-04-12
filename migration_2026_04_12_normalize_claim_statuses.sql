-- Migration: Normalize legacy claim status strings to supported ClaimStatus enum values
-- Date: 2026-04-12
-- Purpose: Prevent 500s caused by enum parsing failures (e.g., CREATED, pending, approved, CANCELLED, in_progress)

BEGIN;

-- Normalize current claim statuses to one of: OPEN, QUALIFIED, ASSIGNED, IN_PROGRESS, CLOSED
UPDATE public.claims
SET status = CASE
    WHEN status IS NULL OR btrim(status) = '' THEN 'OPEN'

    -- Already valid (normalize case)
    WHEN upper(btrim(status)) IN ('OPEN','QUALIFIED','ASSIGNED','IN_PROGRESS','CLOSED')
        THEN upper(btrim(status))

    -- Common legacy aliases
    WHEN lower(btrim(status)) IN ('created','pending','new') THEN 'OPEN'
    WHEN lower(btrim(status)) IN ('approved') THEN 'QUALIFIED'
    WHEN lower(btrim(status)) IN ('cancelled','canceled','cancel') THEN 'CLOSED'

    -- in_progress variants
    WHEN lower(replace(replace(replace(btrim(status), ' ', '_'), '-', '_'), '/', '_')) IN ('in_progress','inprogress')
        THEN 'IN_PROGRESS'

    -- Anything unknown: default to OPEN to avoid blocking updates
    ELSE 'OPEN'
END;

-- Normalize legacy values inside claim_status_history.
-- Unknown/non-status strings are set to NULL (historical rows may contain unrelated text).
UPDATE public.claim_status_history
SET old_status = CASE
    WHEN old_status IS NULL OR btrim(old_status) = '' THEN NULL
    WHEN upper(btrim(old_status)) IN ('OPEN','QUALIFIED','ASSIGNED','IN_PROGRESS','CLOSED')
        THEN upper(btrim(old_status))
    WHEN lower(btrim(old_status)) IN ('created','pending','new','open') THEN 'OPEN'
    WHEN lower(btrim(old_status)) IN ('approved','qualified') THEN 'QUALIFIED'
    WHEN lower(btrim(old_status)) IN ('cancelled','canceled','cancel','closed') THEN 'CLOSED'
    WHEN lower(replace(replace(replace(btrim(old_status), ' ', '_'), '-', '_'), '/', '_')) IN ('in_progress','inprogress')
        THEN 'IN_PROGRESS'
    ELSE NULL
END,
    new_status = CASE
    WHEN new_status IS NULL OR btrim(new_status) = '' THEN NULL
    WHEN upper(btrim(new_status)) IN ('OPEN','QUALIFIED','ASSIGNED','IN_PROGRESS','CLOSED')
        THEN upper(btrim(new_status))
    WHEN lower(btrim(new_status)) IN ('created','pending','new','open') THEN 'OPEN'
    WHEN lower(btrim(new_status)) IN ('approved','qualified') THEN 'QUALIFIED'
    WHEN lower(btrim(new_status)) IN ('cancelled','canceled','cancel','closed') THEN 'CLOSED'
    WHEN lower(replace(replace(replace(btrim(new_status), ' ', '_'), '-', '_'), '/', '_')) IN ('in_progress','inprogress')
        THEN 'IN_PROGRESS'
    ELSE NULL
END;

-- Now that rows are normalized, validate the status check constraint if present.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'claims_status_chk') THEN
        ALTER TABLE public.claims VALIDATE CONSTRAINT claims_status_chk;
    END IF;
END $$;

COMMIT;
