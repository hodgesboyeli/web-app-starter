# Release guide

## When a PR contains a migration

1. Before approval, verify the PR includes the schema change and generated `drizzle/` SQL and metadata. Review the SQL for data loss. On its Vercel preview URL, verify the matching Neon preview branch, test the migrated feature, and confirm test writes remain only on that branch. For changes that delete or substantially rewrite existing data, stop and make a separate release plan.
2. Only the repository owner approves and merges the PR into `main`. Merge one release at a time. Keep the previous production code compatible with this migration while the release builds.
3. Vercel starts a production build from `main` using the production Neon URLs. Before connecting, the build verifies the direct endpoint matches `PRODUCTION_DATABASE_HOST`; a Preview build must differ from it. `npm run build` invokes `npm run db:migrate` on the **direct production connection** before building Next.js. Drizzle applies only migrations absent from the production migration journal. Vercel serves the new deployment only after the entire build succeeds. The preview database and its test records are never copied to production.
4. In Vercel, confirm the production deployment is **Ready** and the expected commit is live. In Neon, inspect the production branch: the new table/column exists, `drizzle.__drizzle_migrations` contains the migration, and existing records remain. Exercise the production feature. Delete the merged Git branch after verification.

A code-only PR follows the same deployment path; with no new migration, Drizzle has nothing to apply.

## If something fails

- **Preview migration/build fails:** its deployment does not become ready. Read Vercel build logs, correct the code or SQL on the feature branch, push again, and retest the preview branch. Production is untouched.
- **Production migration fails:** the new deployment does not become ready. Keep the last working production deployment serving traffic. Inspect Vercel build logs and Neon production state. Fix the migration in a new commit on `main` only after understanding which statements ran; some PostgreSQL operations cannot be rolled back automatically. Redeploy and verify. Do not promote or copy the preview database.
- **Migration succeeds, later build fails:** the prior production code remains live against the new schema. Fix the build and redeploy the same migration safely; Drizzle skips the recorded migration. If old code is incompatible with the new schema, follow a separate recovery plan rather than guessing at a rollback.
- **New deployment is live but unhealthy:** use Vercel rollback to restore the previous code, then assess whether the additive schema can safely remain. Database migrations are not automatically reversed by a code rollback. Write a reviewed forward fix or recovery plan if data or schema repair is needed.

Do not merge another PR until production is healthy. This simple build-time release process is intended for additive, backward-compatible changes; it does not provide zero-downtime handling for destructive migrations or protect two simultaneous production builds from racing.
