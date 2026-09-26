function parseDatabaseUrl(value, label) {
  if (!value) throw new Error(`${label} is required`);
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

export function checkDatabaseTarget({ pooled, direct, productionHost, vercel, vercelEnv }) {
  const pooledUrl = parseDatabaseUrl(pooled, "DATABASE_URL");
  const directUrl = parseDatabaseUrl(direct, "DATABASE_URL_UNPOOLED");

  if (directUrl.hostname.includes("-pooler")) {
    throw new Error("DATABASE_URL_UNPOOLED must use a direct Neon endpoint");
  }
  if (
    pooledUrl.hostname.replace(/-pooler(?=\.)/, "") !== directUrl.hostname ||
    pooledUrl.hostname === directUrl.hostname ||
    pooledUrl.username !== directUrl.username ||
    pooledUrl.pathname !== directUrl.pathname
  ) {
    throw new Error("Pooled and direct URLs must refer to the same Neon database branch");
  }

  if (vercel === "1") {
    if (!["production", "preview"].includes(vercelEnv)) {
      throw new Error("Expected a production or preview Vercel deployment");
    }
    if (!productionHost || !/^[a-z0-9.-]+\.neon\.tech$/i.test(productionHost)) {
      throw new Error("PRODUCTION_DATABASE_HOST must be the direct production Neon hostname");
    }
    const expected = productionHost.toLowerCase();
    if (vercelEnv === "production" && directUrl.hostname !== expected) {
      throw new Error("Production deployment is not using the configured production Neon endpoint");
    }
    if (vercelEnv === "preview" && directUrl.hostname === expected) {
      throw new Error("Preview deployment is targeting the production Neon endpoint");
    }
  }
}
