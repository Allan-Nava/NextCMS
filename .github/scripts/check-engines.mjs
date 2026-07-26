/*
 * File: check-engines.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Asserts that every manifest a deploy might read declares the same Node
// version (NC-72).
//
// This guard exists because the bug it prevents already happened twice. Vercel
// resolves the Node version from the `package.json` at the project's Root
// Directory and falls back to the dashboard setting when there is no
// `engines.node` there. The root manifest had none, so a stale "14.x" in the
// dashboard kept winning and the deploy died before installing anything:
//
//   Found invalid or discontinued Node.js Version: "14.x".
//
// Adding engines to cms/ and admin/ did not help, because those files are not
// the ones being read.
//
import { readFile } from 'node:fs/promises';
//
// Must be one of the versions Vercel offers: 24.x (default), 22.x, 20.x.
const EXPECTED = '24.x';
const MANIFESTS = ['package.json', 'cms/package.json', 'admin/package.json'];
//
let failures = 0;
//
for (const path of MANIFESTS) {
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    const declared = manifest.engines?.node;
    if (declared === undefined) {
        console.error(`${path}: no engines.node — a deploy reading this manifest falls back to the dashboard setting`);
        failures += 1;
        continue;
    }
    if (declared !== EXPECTED) {
        console.error(`${path}: engines.node is "${declared}", expected "${EXPECTED}"`);
        failures += 1;
        continue;
    }
    console.log(`${path}: engines.node = ${declared}`);
}
//
if (failures > 0) {
    console.error(`check-engines: ${failures} manifest(s) out of line. Keep them identical: a deploy may read any of them.`);
    process.exit(1);
}
console.log('check-engines: all manifests agree');
//
