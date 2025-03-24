/**
 * By default, tsc does not copy json or proto files to the dist folder.
 * This postbuild script is used to copy all the required files to the dist folder.
 *
 * This is required to make NSJail work and have a working TypeScript environment.
 */

const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "dist");

// Copy executor.ts-config.json required by NSJail
const tsConfigPath = path.join(
  __dirname,
  "src/nodes/code-executors/nodejs-executor/executor.ts-config.json",
);
const distTsConfigPath = path.join(
  distDir,
  "nodes/code-executors/nodejs-executor/executor.ts-config.json",
);
fs.copyFileSync(tsConfigPath, distTsConfigPath);

// Copy nsjail.nodejs.proto required by NSJail
const nsjailProtoPath = path.join(
  __dirname,
  "src/nodes/code-executors/nodejs-executor/nsjail.nodejs.proto",
);

const distNsjailProtoPath = path.join(
  distDir,
  "nodes/code-executors/nodejs-executor/nsjail.nodejs.proto",
);
fs.copyFileSync(nsjailProtoPath, distNsjailProtoPath);
