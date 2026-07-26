/*
 * File: changelog-section.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Extracts one version's section from CHANGELOG.md, to be used as the body of a
// GitHub release (NC-77).
//
// The changelog is the source of truth for what a release says — the same rule as
// BACKLOG.md for issues. Nothing is generated from commit messages, because the
// changelog already records what was verified and what was not, which a commit log
// does not.
//
// Usage:
//   node .github/scripts/changelog-section.mjs v0.10.0            # prints the body
//   node .github/scripts/changelog-section.mjs v0.10.0 --check    # exit 1 if absent
//
import { readFile } from 'node:fs/promises';
//
export function normaliseVersion(value) {
    return String(value).trim().replace(/^v/, '');
}
//
// Semver, not the major-zero convention: this project lives at 0.x, so treating
// every 0.x tag as a prerelease would make the flag meaningless. Only an explicit
// suffix counts.
export function isPrerelease(version) {
    return normaliseVersion(version).includes('-');
}
//
// Only a heading at the start of a line ends a section — a version reference inside
// a sentence must not truncate the notes.
const HEADING = /^## \[/;
//
export function extractSection(markdown, version) {
    const wanted = normaliseVersion(version);
    const lines = markdown.split('\n');
    const start = lines.findIndex((line) => HEADING.test(line) && line.includes(`[${wanted}]`));
    if (start === -1) return null;
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => HEADING.test(line));
    const body = (end === -1 ? rest : rest.slice(0, end)).join('\n');
    return body.trim();
}
//
async function main() {
    const [version, ...flags] = process.argv.slice(2);
    if (!version) {
        console.error('changelog-section: usage: changelog-section.mjs <version> [--check]');
        process.exit(64);
    }
    const path = process.env.CHANGELOG_PATH ?? 'CHANGELOG.md';
    const markdown = await readFile(path, 'utf8');
    const body = extractSection(markdown, version);
    if (body === null || body.length === 0) {
        // A tag without a changelog section breaks this project's own rule, so the
        // release fails loudly rather than publishing an empty one.
        console.error(
            `changelog-section: no section for ${normaliseVersion(version)} in ${path}. ` +
                'Every tag must have one — see the release rules in CLAUDE.md.'
        );
        process.exit(1);
    }
    if (flags.includes('--check')) {
        console.error(`changelog-section: ${normaliseVersion(version)} found (${body.split('\n').length} lines)`);
        return;
    }
    process.stdout.write(`${body}\n`);
}
//
if (process.argv[1] && process.argv[1].endsWith('changelog-section.mjs')) {
    main().catch((error) => {
        console.error(`changelog-section: ${error.message}`);
        process.exit(1);
    });
}
//
