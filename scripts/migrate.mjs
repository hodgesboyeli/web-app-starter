import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const pooled = process.env.DATABASE_URL;
const direct = process.env.DATABASE_URL_UNPOOLED;
if (!pooled || !direct) {
  throw new Error("Both DATABASE_URL and DATABASE_URL_UNPOOLED are required");
}

function parseDatabaseUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is not a valid URL`);
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error(`${label} must be a PostgreSQL URL`);
  }
  return url;
}

const pooledUrl = parseDatabaseUrl(pooled, "DATABASE_URL");
const directUrl = parseDatabaseUrl(direct, "DATABASE_URL_UNPOOLED");
if (directUrl.hostname.includes("-pooler")) {
  throw new Error("DATABASE_URL_UNPOOLED must use a direct Neon endpoint");
}
if (
  pooledUrl.hostname.replace("-pooler", "") !== directUrl.hostname ||
  pooledUrl.username !== directUrl.username ||
  pooledUrl.pathname !== directUrl.pathname
) {
  throw new Error("Pooled and direct URLs must refer to the same Neon database branch");
}
if (process.env.VERCEL === "1" && !["production", "preview"].includes(process.env.VERCEL_ENV)) {
  throw new Error("Expected a production or preview Vercel deployment");
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
