# Web app starter

Minimal Next.js, TypeScript, Drizzle, Neon, and Vercel starter. This repository is a **GitHub template**: each app gets its own repository, Neon project, and Vercel project. The page is intentionally just a placeholder.

## Start your first app

1. On GitHub, select **Use this template → Create a new repository**. Give the new app its own name and clone that new repository. Its `main` branch is production. Do not keep working in this template repository.
2. In the new repository, run `npm ci` and `npm run build`. The local build does not need a database. Keep the repository private unless you intend to publish its code. If your GitHub plan supports branch protection for this repository, set `main` to require a PR before merge. GitHub Free can enforce this on public repositories, but not private ones; for a private Free repository, follow the PR-only rule yourself. If you are the sole maintainer, do not require an approving review: GitHub does not let a PR author approve their own PR. Review each PR and click **Merge** yourself; do not enable auto-merge. Repository rules do not transfer from this template.
3. Create a **new Neon project for this app** on the free plan. Keep its default/production database branch for the production site. Do not reuse another app's Neon project or copy its credentials into the repository.
4. Create a **new Vercel project for this app** from the new GitHub repository on the free Hobby plan. Set `main` as its production Git branch. **Before the first successful production deployment, check the Production configuration:** the Vercel project must be linked to this app's Neon project and its production `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) must point to that project's production branch. Copy only the hostname from the **direct** production URL (for example, `ep-...neon.tech`, without `postgresql://`, user, password, or database name) into a Vercel environment variable named `PRODUCTION_DATABASE_HOST` for **both Production and Preview**. Check it against the production URL before deploying. The build fails if this value or either URL is missing or points at the wrong endpoint. If Vercel requires creating the project before you can connect Neon, let the initial unconfigured build fail, connect Neon, verify the configuration, and only then redeploy.
5. In the [Neon-managed Vercel integration](https://neon.com/docs/guides/neon-managed-vercel-integration), choose **Link Existing Neon Account**, then connect this app's Neon project, database, and role to this app's Vercel project. Enable preview branching and automatic cleanup of obsolete preview branches. The integration supplies both database URLs for production and a separate Neon branch for each Vercel feature preview. Remove any manually set Preview database URLs that could override it. Check that Preview deployments wait for the database branch to be ready. If you instead create Neon through Vercel, [enable Required → Preview and “Resource must be active before deployment”](https://neon.com/docs/guides/vercel-managed-integration#enable-automated-preview-branching-recommended). Use one integration path per app.
6. Deploy `main`. Confirm the Vercel production deployment is ready and its Neon target is the production branch. Then create a descriptive feature branch from updated `main`, push it, and verify Vercel gives it a preview URL and Neon creates a different branch. Test on that URL. Open a PR; **you** approve and merge it after review. See [RELEASE.md](RELEASE.md) for the release and failure procedure.

This starter has no API keys, connection strings, project IDs, or app data. Keep `.env.local`, `.vercel/`, and `.neon` untracked. Never put database URLs in `NEXT_PUBLIC_` variables. The Neon integration supplies deployment secrets; no GitHub Actions secrets or deployment token are needed.

## Build and migrations

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependencies. |
| `npm run build` | Build locally without touching a database; on Vercel, migrate the selected Neon branch first, then build. |
| `npm run typecheck` | Check TypeScript. |
| `npm run test:db-target` | Test the deployment database safety check using synthetic URLs. |
| `npm run db:generate -- --name=add_example_table` | Generate a versioned SQL migration from exported tables in `src/db/schema.ts`. Review and commit the SQL and Drizzle metadata with the code. |
| `npm run db:migrate` | Apply pending migrations to the branch named by `DATABASE_URL_UNPOOLED`. Requires the matching pooled `DATABASE_URL` as a safety check. |

Only change the schema file and generate a migration when the database structure changes. Do **not** add a migration for code-only features. Do not use `drizzle-kit push` against deployment databases. For a local migration test, put the two URLs of a disposable Neon branch in an untracked `.env.local` (see `.env.example`), then run `npm run db:migrate`. Never use production credentials for local experiments.

The Vercel build runs `db:migrate` before `next build`. Before opening a database connection, it checks that the pooled and direct URLs identify the same branch, that Production uses `PRODUCTION_DATABASE_HOST`, and that Preview uses a **different** endpoint. A missing or wrong host, migration error, or build error stops deployment. Drizzle records applied migrations in each database's `drizzle.__drizzle_migrations` table, so repeated builds skip completed migrations. A new app with no schema changes has an empty migration journal. Add tables only when your app needs them. The hostname check depends on setting `PRODUCTION_DATABASE_HOST` correctly for each app; verify it during setup and after changing the production Neon compute endpoint.

**Data rule:** Ordinary additive migrations, such as adding a table or nullable column, preserve existing production records. Never replace production with a preview branch. Deleting or substantially transforming existing data needs a separate reviewed release plan with backup, compatibility, and rollback steps. Neon preview branches can initially contain copies of production data; if an app holds sensitive personal or patient information, do not use this default preview setup until a safe test-data design is in place. Use synthetic or sanitized data in an isolated preview source.

## Feature flow

Update `main`, create `feature/describe-change`, commit and push. Vercel builds a preview using an isolated Neon branch; any committed migration runs there. Test the preview URL and inspect the Neon branch before approval. Merge one approved PR at a time, wait for production to finish, and verify it before merging the next. Delete the feature Git branch after release so preview branch cleanup can run. See [AGENTS.md](AGENTS.md) for the rules Codex should follow in each generated app.
