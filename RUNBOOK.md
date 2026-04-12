# CMMS Monolith Runbook

## Backend (Monolith)

### Run
- Command:
  - `mvn -f identity-service/pom.xml spring-boot:run`
- Default URL:
  - `http://localhost:8081`
- Swagger UI:
  - `http://localhost:8081/swagger-ui.html`

### Admin Login (Password Recovery)
- If `admin@hospital.com` exists in the DB but you don't know its password, you can reset it on startup (disabled by default).
- PowerShell example (one-time session env vars):
  - `$env:BOOTSTRAP_ADMIN_ENABLED='true'; $env:BOOTSTRAP_ADMIN_EMAIL='admin@hospital.com'; $env:BOOTSTRAP_ADMIN_PASSWORD='YourNewPasswordHere'; mvn -f identity-service/pom.xml spring-boot:run`
- After you log in successfully, remove those env vars (or set `BOOTSTRAP_ADMIN_ENABLED=false`) to avoid accidental resets.

### Required Environment Variables
- `DB_URL` (default: `jdbc:postgresql://127.0.0.1:5432/cmms?stringtype=unspecified`)
- `DB_USERNAME` (default: `postgres`)
- `DB_PASSWORD` (default: `akira123`)
- `JWT_SECRET` (default: dev secret in config)
- `HIBERNATE_DDL_AUTO` (default: `validate`)
- `STORAGE_LOCATION` (default: `uploads/documents`)
- `CORS_ALLOWED_ORIGINS` (default: `http://localhost:3000,http://localhost:5173`)
- `SERVER_PORT` (default: `8081`)

### Database Migration Order (Already Applied)
1. `migration_mydb_to_data.sql`
2. `migration_normalize_equipment_status.sql`
3. `migration_2026_04_12_claims_module.sql` (required for Claims module + `departments.site_id`)
4. `migration_2026_04_12_normalize_claim_statuses.sql` (required if legacy claim status strings exist; prevents `/api/claims` 500)

### Schema Policy
- Friend-first schema (data.sql)
- Compatibility mode (extra non-conflicting columns preserved)

## Frontend (Identity Frontend)

### Run
- Command:
  - `npm.cmd install`
  - `npm.cmd run dev -- --host 0.0.0.0 --port 3000`
- URL:
  - `http://localhost:3000`

### Frontend Config
- `VITE_API_BASE_URL` (default: `http://localhost:8081/api`)

## Basic Smoke Tests
1. `POST /api/auth/login`
2. `GET /api/users`
3. `GET /api/roles`
4. `GET /api/departments`
5. `GET /api/equipment`
6. `GET /api/meters`
7. `GET /api/maintenance-plans`

## Notes
- Use `HIBERNATE_DDL_AUTO=validate` in production to prevent schema drift.
- Set `JWT_SECRET` to a strong, Base64-encoded 256-bit key for production.
