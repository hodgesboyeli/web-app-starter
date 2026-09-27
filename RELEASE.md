# Release guide

## When a PR contains a migration

1. Before approval, verify the PR includes the schema change and generated `drizzle/` SQL and metadata. Review the SQL for data loss. On its Vercel preview URL, verify the matching Neon preview branch, test the migrated feature, and confirm test writes remain only on that branch. For changes that delete or substantially rewrite existing data, stop and make a separate release plan.
2. Codex opens the PR and waits for the owner's review. The default is for the owner to click Merge. Never enable auto-merge. If the owner explicitly asks Codex in chat to merge an identified PR (by number, link, or unambiguous context), Codex may do so after confirming it is current with `main`, its Preview and database isolation remain verified, and the release checks pass. Approval of a plan or a general "looks good" alone is not an instruction to merge. Merge one release at a time. Keep the previous production code compatible with this migration while the release builds.
3. Vercel starts a production build from `main` using the production Neon URLs. Before connecting, the build verifies the direct endpoint matches `PRODUCTION_DATABASE_HOST`; a Preview build must differ from it. `npm run build` invokes `npm run db:migrate` on the **direct production connection** before building Next.js. Drizzle applies only migrations absent from the production migration journal. Vercel serves the new deployment only after the entire build succeeds. The preview database and its test records are never copied to production.
4. After either merge path, verify in Vercel that the production deployment is **Ready** and the expected commit is live. In Neon, inspect the production branch: the new table/column exists, `drizzle.__drizzle_migrations` contains the migration, and existing records remain. Exercise the production feature. When Codex handles release cleanup, remove the merged Git branch and only unused Preview deployments associated with it; confirm its Neon Preview branch is removed when applicable. Do not remove another active Preview or the production Neon branch.

A code-only PR follows the same deployment path; with no new migration, Drizzle has nothing to apply.

## If something fails

- **Preview migration/build fails:** its deployment does not become ready. Read Vercel build logs, correct the code or SQL on the feature branch, push again, and retest the preview branch. Production is untouched.
- **Production migration fails:** the new deployment does not become ready. Keep the last working production deployment serving traffic. Inspect Vercel build logs and Neon production state. Fix the migration in a new commit on `main` only after understanding which statements ran; some PostgreSQL operations cannot be rolled back automatically. Redeploy and verify. Do not promote or copy the preview database.
- **Migration succeeds, later build fails:** the prior production code remains live against the new schema. Fix the build and redeploy the same migration safely; Drizzle skips the recorded migration. If old code is incompatible with the new schema, follow a separate recovery plan rather than guessing at a rollback.
- **New deployment is live but unhealthy:** use Vercel rollback to restore the previous code, then assess whether the additive schema can safely remain. Database migrations are not automatically reversed by a code rollback. Write a reviewed forward fix or recovery plan if data or schema repair is needed.

Do not merge another PR until production is healthy. This simple build-time release process is intended for additive, backward-compatible changes; it does not provide zero-downtime handling for destructive migrations or protect two simultaneous production builds from racing.
