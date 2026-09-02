# DredgeTrack

Operational control centre for dredging projects. The interface is deployable on GitHub Pages; Supabase provides the production data layer.

## Supabase setup

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor.
2. In Supabase Authentication, enable the intended login method (email/password is the recommended starting point).
3. Copy the project URL and **anon/public** key into [`config.js`](config.js). Do not use a service-role key in a browser.
4. In Storage, use the `operational-documents` bucket for Excel, PDF, and Word files. Add final storage policies before allowing production uploads.
5. Commit the `config.js` values and redeploy GitHub Pages, or replace it with environment-specific build configuration.

Until credentials are added, file metadata, approvals, and shift-log interactions stay in the browser's local storage as a demo fallback.

## Production hardening required

- Replace the starter open authenticated policies with project-membership policies.
- Define roles and approval thresholds for each organisation.
- Set retention, audit, document scanning, and backup policies.
- Add server-side document extraction/report generation for large or sensitive uploads.

