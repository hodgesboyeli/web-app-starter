import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import { checkDatabaseTarget } from "./check-database-target.mjs";

config({ path: ".env.local", quiet: true });

checkDatabaseTarget({
  pooled: process.env.DATABASE_URL,
  direct: process.env.DATABASE_URL_UNPOOLED,
  productionHost: process.env.PRODUCTION_DATABASE_HOST,
  vercel: process.env.VERCEL,
  vercelEnv: process.env.VERCEL_ENV,
});

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
