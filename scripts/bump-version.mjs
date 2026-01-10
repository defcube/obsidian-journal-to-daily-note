import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const targetVersion = process.env.npm_package_version;

if (!targetVersion) {
  console.error(
    "Error: This script is meant to be run via 'npm version <newversion>'.",
  );
  process.exit(1);
}

// Update manifest.json
const manifestPath = join(process.cwd(), "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// Update versions.json
const versionsPath = join(process.cwd(), "versions.json");
let versions = {};
try {
  versions = JSON.parse(readFileSync(versionsPath, "utf8"));
} catch {
  // File might not exist yet or be empty
}
versions[targetVersion] = manifest.minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + "\n");

console.log(
  `Updated manifest.json and versions.json to version ${targetVersion}`,
);
