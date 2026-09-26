import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.VERCEL === "1") {
  if (!["production", "preview"].includes(process.env.VERCEL_ENV)) {
    throw new Error("Expected VERCEL_ENV=production or preview during Vercel build");
  }
  run("npm", ["run", "db:migrate"]);
}

run("npx", ["next", "build"]);
