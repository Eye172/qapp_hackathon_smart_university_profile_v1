import { execSync } from "child_process";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter(l => l.includes("="))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")]; })
);

execSync("npx prisma migrate dev --name add_university_stats_fields", {
  stdio: "inherit",
  env: { ...process.env, ...env },
});
