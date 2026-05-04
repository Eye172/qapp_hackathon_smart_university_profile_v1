import { execSync, spawn } from "child_process";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")]; })
);

// Kill port 3000
try {
  execSync('npx kill-port 3000', { stdio: "pipe" });
} catch (_) {}
try {
  execSync('npx prisma generate', { stdio: "inherit", env: { ...process.env, ...env } });
} catch (e) {
  console.log("Generate warning (may be OK if types updated):", e.message?.slice(0, 100));
}

console.log("Starting Next.js dev server...");
const child = spawn("npx", ["next", "dev", "--port", "3000"], {
  stdio: "inherit",
  detached: true,
  env: { ...process.env, ...env },
  shell: true,
});
child.unref();
console.log("Dev server starting on http://localhost:3000");
