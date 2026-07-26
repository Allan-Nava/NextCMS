/*
 * File: changelog-section.test.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-77). This parser decides what a published
// GitHub release says, so a mis-parse is public: it either ships an empty release
// or the notes of the wrong version.
//
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractSection, isPrerelease, normaliseVersion } from './changelog-section.mjs';
//
const SAMPLE = `# Changelog

Preamble that belongs to no version.

## [0.10.0] - 2026-07-26

Most of M5.

### Added

- A thing.

## [0.9.1] - 2026-07-26

### Fixed

- Another thing. Mentions ## [0.9.0] inside a line.

## [0.2.11] and earlier

Older releases: see the tags.
`;
//
test('extracts the body of a version', () => {
    const body = extractSection(SAMPLE, '0.10.0');
    assert.match(body, /Most of M5\./);
    assert.match(body, /- A thing\./);
});
//
test('stops at the next version heading', () => {
    const body = extractSection(SAMPLE, '0.10.0');
    assert.ok(!body.includes('Another thing'), 'leaked into the next section');
    assert.ok(!body.includes('0.9.1'), 'included the next heading');
});
//
test('does not include the version heading itself — the release title carries it', () => {
    assert.ok(!extractSection(SAMPLE, '0.10.0').includes('## [0.10.0]'));
});
//
test('keeps subheadings and is not confused by them', () => {
    assert.match(extractSection(SAMPLE, '0.9.1'), /### Fixed/);
});
//
test('is not fooled by a version reference inside a line', () => {
    // "## [0.9.0]" appears mid-sentence in the 0.9.1 body; only a heading at the
    // start of a line ends a section.
    const body = extractSection(SAMPLE, '0.9.1');
    assert.match(body, /Mentions ## \[0\.9\.0\] inside a line/);
});
//
test('handles the last section in the file', () => {
    const body = extractSection(SAMPLE, '0.2.11');
    assert.match(body, /Older releases/);
});
//
test('accepts a tag with or without the leading v', () => {
    assert.equal(extractSection(SAMPLE, 'v0.10.0'), extractSection(SAMPLE, '0.10.0'));
});
//
test('returns null for a version with no section', () => {
    assert.equal(extractSection(SAMPLE, '9.9.9'), null);
});
//
test('never returns a blank body for a section that exists', () => {
    const body = extractSection(SAMPLE, '0.10.0');
    assert.ok(body.trim().length > 0);
});
//
test('normaliseVersion strips the tag prefix', () => {
    assert.equal(normaliseVersion('v1.2.3'), '1.2.3');
    assert.equal(normaliseVersion('1.2.3'), '1.2.3');
    assert.equal(normaliseVersion('  v1.2.3  '), '1.2.3');
});
//
test('isPrerelease follows semver, not the major-zero convention', () => {
    // 0.x is where this project lives; marking every release a prerelease would
    // make the flag meaningless.
    assert.equal(isPrerelease('0.10.0'), false);
    assert.equal(isPrerelease('1.0.0'), false);
    assert.equal(isPrerelease('1.0.0-rc.1'), true);
    assert.equal(isPrerelease('v0.11.0-beta'), true);
});
//
test('parses the real CHANGELOG.md for the latest released version', async () => {
    // Guards against the fixture above drifting away from the real file.
    const markdown = await readFile(new URL('../../CHANGELOG.md', import.meta.url), 'utf8');
    const versions = Array.from(markdown.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm), (m) => m[1]);
    assert.ok(versions.length >= 5, `expected several versions, found ${versions.length}`);
    for (const version of versions) {
        const body = extractSection(markdown, version);
        assert.ok(body && body.trim().length > 0, `${version} produced an empty body`);
        assert.ok(!body.includes('\n## ['), `${version} leaked into the next section`);
    }
});
//
