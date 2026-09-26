import assert from "node:assert/strict";
import test from "node:test";
import { checkDatabaseTarget } from "./check-database-target.mjs";

const productionHost = "ep-production.us-east-2.aws.neon.tech";
const previewHost = "ep-preview.us-east-2.aws.neon.tech";
const urls = (host) => ({
  pooled: `postgresql://user:example@${host.replace(".", "-pooler.")}/app`,
  direct: `postgresql://user:example@${host}/app`,
});

test("production must use its configured endpoint", () => {
  assert.doesNotThrow(() => checkDatabaseTarget({
    ...urls(productionHost), productionHost, vercel: "1", vercelEnv: "production",
  }));
  assert.throws(() => checkDatabaseTarget({
    ...urls(previewHost), productionHost, vercel: "1", vercelEnv: "production",
  }), /Production deployment is not using/);
});

test("preview must not use the production endpoint", () => {
  assert.doesNotThrow(() => checkDatabaseTarget({
    ...urls(previewHost), productionHost, vercel: "1", vercelEnv: "preview",
  }));
  assert.throws(() => checkDatabaseTarget({
    ...urls(productionHost), productionHost, vercel: "1", vercelEnv: "preview",
  }), /Preview deployment is targeting/);
});

test("deployment fails closed without a verified production hostname", () => {
  assert.throws(() => checkDatabaseTarget({
    ...urls(previewHost), vercel: "1", vercelEnv: "preview",
  }), /PRODUCTION_DATABASE_HOST/);
  assert.throws(() => checkDatabaseTarget({
    ...urls(previewHost), productionHost: "https://example.com", vercel: "1", vercelEnv: "preview",
  }), /PRODUCTION_DATABASE_HOST/);
});

test("pooled and direct URLs must identify the same branch", () => {
  assert.throws(() => checkDatabaseTarget({
    pooled: urls(productionHost).pooled,
    direct: urls(previewHost).direct,
    productionHost,
    vercel: "1",
    vercelEnv: "preview",
  }), /same Neon database branch/);
});
