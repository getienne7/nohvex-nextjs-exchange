# Summary of Recent Changes

## Roadmap Updates
- Expanded Security & Compliance with detailed 2FA (TOTP, WebAuthn, backup codes), RBAC, secrets mgmt
- Added QA/Observability section (structured logging, metrics, tracing, dashboards)
- PWA: added Offline Support and Background Sync
- Platform: added Admin Console feature
- Next Sprint: added 2FA API smoke tests item

## 2FA Backend Changes
- Persist 2FA in DB (schema fields: twoFAEnabled, twoFASecret, twoFABackupCodes, twoFAEnabledAt, twoFALastUsed)
- DB service helpers: set2FA, markBackupCodeUsed; safe disconnect
- 2FA routes moved from in-memory to DB-backed state
- Login route now checks DB-backed 2FA

## Database
- Prisma db push executed; schema is in sync with Neon database

