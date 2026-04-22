-- ============================================================
-- Migration: Multi-Role Support for Users
-- Date: 2026-04-22
-- Description: Replace single role_id column with user_roles
--              many-to-many join table, preserving existing data.
-- ============================================================

-- Step 1: Create the join table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Step 2: Migrate existing role assignments into the join table
INSERT INTO user_roles (user_id, role_id)
SELECT user_id, role_id
FROM users
WHERE role_id IS NOT NULL
ON DUPLICATE KEY UPDATE user_id = user_id; -- safe no-op on re-run

-- Step 3: Drop the old single role_id column (run AFTER confirming migration is correct)
-- ALTER TABLE users DROP FOREIGN KEY fk_users_role;   -- Drop FK if it exists
-- ALTER TABLE users DROP COLUMN role_id;

-- NOTE: The two ALTER statements above are commented out intentionally.
-- Verify that all data is correctly in user_roles before executing them.
-- You can verify with:
--   SELECT u.user_id, u.email, ur.role_id FROM users u LEFT JOIN user_roles ur ON u.user_id = ur.user_id;
