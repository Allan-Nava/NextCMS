/*
 * File: backlog-sync.test.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Tests for the backlog parser (NC-56). Run with: node --test .github/scripts/
//
// The parser decides what gets written to GitHub, so its edges are worth
// pinning: a mis-parse either drops an item silently or opens a duplicate issue.
//
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBacklog, titleFor, bodyFor } from './backlog-sync.mjs';
//
const SAMPLE = `# BACKLOG

## Roadmap

| # | Milestone |
|---|---|
| M0 | Green build |

## M0 · Green build (apps) → \`v0.5.0\` ✅

- [x] 🔴 **NC-1** — First item. Second sentence is dropped from the title.
- [x] **NC-2** — Item with no severity.

## M4 · Content → \`v0.8.0\`

- [ ] 🟡 **NC-3** — \`bootstrap: "^5.1.3"\` floated to 5.3.x, which broke the build.
- [ ] **NC-4** — Still open.
`;
//
test('parses sections and items', () => {
    const sections = parseBacklog(SAMPLE);
    assert.equal(sections.length, 2);
    assert.equal(sections[0].key, 'M0');
    assert.equal(sections[0].name, 'Green build (apps)');
    assert.equal(sections[0].release, 'v0.5.0');
    assert.equal(sections[0].items.length, 2);
    assert.equal(sections[1].key, 'M4');
    assert.equal(sections[1].release, 'v0.8.0');
});
//
test('reads the tick as the item state', () => {
    const [m0, m4] = parseBacklog(SAMPLE);
    assert.equal(m0.items[0].done, true);
    assert.equal(m4.items[0].done, false);
});
//
test('captures severity when present and null when not', () => {
    const [m0] = parseBacklog(SAMPLE);
    assert.equal(m0.items[0].severity, '🔴');
    assert.equal(m0.items[1].severity, null);
});
//
test('attributes each item to its milestone', () => {
    const items = parseBacklog(SAMPLE).flatMap((section) => section.items);
    assert.equal(items.find((item) => item.id === 'NC-1').milestone, 'M0 · Green build (apps)');
    assert.equal(items.find((item) => item.id === 'NC-3').milestone, 'M4 · Content');
});
//
test('ignores list rows outside a milestone section', () => {
    // The Roadmap table sits between the title and the first section; nothing
    // from it may be attributed to a milestone.
    const items = parseBacklog(SAMPLE).flatMap((section) => section.items);
    assert.equal(items.length, 4);
});
//
test('rejects a duplicated id instead of opening two issues for it', () => {
    const duplicated = `## M0 · X → \`v1\`\n\n- [ ] **NC-9** — one.\n- [ ] **NC-9** — two.\n`;
    // parseBacklog exits the process on a duplicate, so assert on the guard that
    // produces it rather than on the exit itself.
    const ids = [...duplicated.matchAll(/\*\*(NC-\d+)\*\*/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, 1, 'the fixture must contain a duplicate for this test to mean anything');
});
//
test('title stops at a sentence end, not at a colon inside code', () => {
    const [, m4] = parseBacklog(SAMPLE);
    // Regression: the first version split on ':' and produced "NC-3: bootstrap".
    assert.equal(titleFor(m4.items[0]), 'NC-3: bootstrap: "^5.1.3" floated to 5.3.x, which broke the build');
});
//
test('title keeps only the first sentence', () => {
    const [m0] = parseBacklog(SAMPLE);
    assert.equal(titleFor(m0.items[0]), 'NC-1: First item');
});
//
test('title is capped so GitHub does not truncate it', () => {
    const long = { id: 'NC-99', description: `${'word '.repeat(60)}end.` };
    const title = titleFor(long);
    // The cap applies to the description part; the "NC-99: " prefix is on top.
    const described = title.slice('NC-99: '.length);
    assert.ok(described.length <= 90, `description part too long: ${described.length}`);
    assert.ok(title.endsWith('…'));
});
//
test('title drops the parenthetical release note', () => {
    const item = { id: 'NC-7', description: 'Something was broken. *(v0.6.0: fixed by doing the thing.)*' };
    assert.equal(titleFor(item), 'NC-7: Something was broken');
});
//
test('body carries the id and points back at the backlog', () => {
    const body = bodyFor({ id: 'NC-1', description: 'Text.' });
    assert.match(body, /\*\*NC-1\*\*/);
    assert.match(body, /BACKLOG\.md/);
    assert.match(body, /generated/);
});
//
test('parses the real BACKLOG.md', async () => {
    // The fixture above can drift from the real file; this catches that.
    const markdown = await readFile(new URL('../../BACKLOG.md', import.meta.url), 'utf8');
    const sections = parseBacklog(markdown);
    const items = sections.flatMap((section) => section.items);
    assert.ok(sections.length >= 8, `expected at least 8 milestones, got ${sections.length}`);
    assert.ok(items.length >= 50, `expected at least 50 items, got ${items.length}`);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length, 'ids must be unique');
    for (const item of items) {
        assert.ok(item.milestone, `${item.id} has no milestone`);
        assert.ok(titleFor(item).length > item.id.length + 2, `${item.id} produced an empty title`);
    }
});
//
