/*
 * File: check-anchors.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Checks that every in-page link in the documentation resolves (NC-57).
//
// The docs site is one HTML file navigated entirely by anchors, so a renamed
// heading silently breaks the sidebar — html-validate does not catch that, and it
// is the failure a reader notices first.
//
// Usage: node .github/scripts/check-anchors.mjs docs/index.html
//
import { readFile } from 'node:fs/promises';
//
const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('check-anchors: no file given');
    process.exit(1);
}
//
let failures = 0;
//
for (const file of files) {
    const html = await readFile(file, 'utf8');
    const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
    const anchors = Array.from(html.matchAll(/href="#([^"]+)"/g), (match) => match[1]);
    const missing = anchors.filter((anchor) => !ids.has(anchor));
    // A duplicate id makes an anchor ambiguous, which is a real bug even though
    // browsers pick the first silently.
    const allIds = Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
    const duplicated = allIds.filter((id, index) => allIds.indexOf(id) !== index);

    if (missing.length > 0) {
        console.error(`${file}: ${missing.length} anchor(s) point at no id: ${[...new Set(missing)].join(', ')}`);
        failures += 1;
    }
    if (duplicated.length > 0) {
        console.error(`${file}: duplicate id(s): ${[...new Set(duplicated)].join(', ')}`);
        failures += 1;
    }
    if (missing.length === 0 && duplicated.length === 0) {
        console.log(`${file}: ${anchors.length} anchors, ${ids.size} ids, all resolve`);
    }
}
//
process.exit(failures === 0 ? 0 : 1);
//
