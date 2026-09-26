# Project rules

- `main` is production. Start each feature from current `main` on a descriptive branch. Work in the generated app repository, not this template.
- Test pushed feature branches on their Vercel preview URLs. Confirm each preview uses its own Neon branch before making test writes. Never point a preview at the production database.
- Export schema changes from `src/db/schema.ts`, run `npm run db:generate -- --name=short_description`, review the SQL, and commit the migration with the code. Test it on the preview branch. Create no migration for code-only changes. Never use `drizzle-kit push` on deployment databases.
- Keep schema migrations backward compatible with the currently live production code. Preserve production records for routine additive changes. Deletions or major data transformations need a separate release plan. Never replace production data with a preview branch.
- Only the owner approves and merges PRs into `main`. Do not auto-merge. Merge one PR at a time and verify its production deployment before merging another.
- Do not commit secrets, database URLs, project IDs, or app-specific configuration to the template. Each generated app owns separate Neon and Vercel projects.
- If production holds sensitive personal or patient data, use synthetic or sanitized data for previews; do not branch that data into a publicly reachable preview.
