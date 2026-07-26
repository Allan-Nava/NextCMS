/*
 * File: backlog-sync.mjs
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Reconciles BACKLOG.md with GitHub issues and milestones (NC-55).
//
// BACKLOG.md stays the single source of truth: this script never writes to it.
// It parses the file and makes GitHub match — one issue per `NC-n` item, grouped
// into a milestone per `## Mn` section. Ticking an item closes its issue,
// unticking reopens it.
//
// The `NC-n` id is the key, so the run is idempotent: re-running changes nothing
// when nothing changed, and an edited description updates the existing issue
// rather than opening a second one.
//
// Zero dependencies: Node 18+ global fetch, and the token GitHub Actions
// already provides.
//
// Usage:
//   GH_TOKEN=... GH_REPO=owner/name node .github/scripts/backlog-sync.mjs
//   DRY_RUN=1 node .github/scripts/backlog-sync.mjs        # parse and print, no writes
//
import { readFile } from 'node:fs/promises';
//
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const REPO = process.env.GH_REPO;
const TOKEN = process.env.GH_TOKEN;
const BACKLOG_PATH = process.env.BACKLOG_PATH ?? 'BACKLOG.md';
const API = 'https://api.github.com';
//
const SEVERITY_LABELS = {
    '🔴': { name: 'severity:critical', color: 'b60205' },
    '🟠': { name: 'severity:high', color: 'd93f0b' },
    '🟡': { name: 'severity:medium', color: 'fbca04' },
    '⚪': { name: 'severity:debt', color: 'ededed' },
};
const BACKLOG_LABEL = { name: 'backlog', color: '0e8a16' };
//
// A heading like:  ## M3 · Working auth → `v0.7.0` ✅
const SECTION_RE = /^##\s+(M\d+\w*)\s*·\s*(.+?)\s*(?:→\s*`?(v[\d.]+)`?)?\s*(✅)?\s*$/;
// An item like:    - [x] 🟠 **NC-53** — No rate limiting on ...
const ITEM_RE = /^-\s+\[( |x)\]\s+(?:(🔴|🟠|🟡|⚪)\s+)?\*\*(NC-\d+)\*\*\s+—\s+(.*)$/;
//
function fail(message) {
    console.error(`backlog-sync: ${message}`);
    process.exit(1);
}
//
// ---------------------------------------------------------------- parsing ---
//
export function parseBacklog(markdown) {
    const sections = [];
    let current = null;
    const seen = new Set();
    markdown.split('\n').forEach((line, index) => {
        const heading = SECTION_RE.exec(line);
        if (heading) {
            const [, key, name, release] = heading;
            current = { key, name, release: release ?? null, items: [] };
            sections.push(current);
            return;
        }
        // A new `##` that is not a milestone (Roadmap, for instance) ends the
        // current section, so stray list items are not attributed to it.
        if (line.startsWith('## ')) {
            current = null;
            return;
        }
        const item = ITEM_RE.exec(line);
        if (item) {
            const [, done, severity, id, description] = item;
            if (!current) {
                console.warn(`backlog-sync: ${id} on line ${index + 1} is outside any milestone section, skipped`);
                return;
            }
            if (seen.has(id)) fail(`${id} appears more than once — ids must be unique`);
            seen.add(id);
            current.items.push({
                id,
                done: done === 'x',
                severity: severity ?? null,
                description: description.trim(),
                milestone: `${current.key} · ${current.name}`,
            });
            return;
        }
        // Catch an item that carries an id but does not match the expected
        // shape, rather than silently dropping it.
        if (/^-\s+\[[ x]\]/.test(line) && /\bNC-\d+\b/.test(line)) {
            console.warn(`backlog-sync: line ${index + 1} looks like an item but does not parse: ${line.trim()}`);
        }
    });
    return sections;
}
//
// The description is a paragraph; the issue needs a one-line title. Take the
// first sentence, drop the markdown, and keep it short.
//
// A sentence ends at a period followed by a capital, and nowhere else: colons
// and semicolons are everywhere in this backlog (`bootstrap: "^5.1.3"`), and so
// are periods inside identifiers (`schema.prisma`, `[...index].tsx`). Splitting
// on those produced titles like "NC-52: bootstrap".
export function titleFor(item) {
    const withoutParenthetical = item.description.replace(/\*\((?:.|\n)*?\)\*/g, '').trim();
    const plain = withoutParenthetical
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\*\*([^*]*)\*\*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    const firstSentence = /^(.*?\.)(?=\s+[A-Z])/.exec(plain)?.[1] ?? plain;
    const trimmed = firstSentence.replace(/\.$/, '');
    const short = trimmed.length > 90 ? `${trimmed.slice(0, 89).trimEnd()}…` : trimmed;
    return `${item.id}: ${short}`;
}
//
export function bodyFor(item) {
    return [
        item.description,
        '',
        '---',
        `Tracked as **${item.id}** in [BACKLOG.md](../blob/main/BACKLOG.md), the single source of truth.`,
        'This issue is generated — edit the backlog entry, not the issue.',
    ].join('\n');
}
//
// ------------------------------------------------------------------- api ---
//
async function api(method, path, body) {
    const response = await fetch(`${API}/repos/${REPO}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`${method} ${path} -> ${response.status} ${detail}`);
    }
    return response.status === 204 ? null : response.json();
}
//
async function apiAll(path) {
    const out = [];
    for (let page = 1; ; page += 1) {
        const separator = path.includes('?') ? '&' : '?';
        const batch = await api('GET', `${path}${separator}per_page=100&page=${page}`);
        out.push(...batch);
        if (batch.length < 100) return out;
    }
}
//
async function ensureLabels(severitiesInUse) {
    const wanted = [BACKLOG_LABEL, ...severitiesInUse.map((s) => SEVERITY_LABELS[s]).filter(Boolean)];
    const existing = new Set((await apiAll('/labels')).map((label) => label.name));
    for (const label of wanted) {
        if (existing.has(label.name)) continue;
        console.log(`+ label ${label.name}`);
        await api('POST', '/labels', { name: label.name, color: label.color });
    }
}
//
async function ensureMilestones(sections) {
    const existing = await apiAll('/milestones?state=all');
    const byTitle = new Map(existing.map((milestone) => [milestone.title, milestone]));
    const resolved = new Map();
    for (const section of sections) {
        const title = `${section.key} · ${section.name}`;
        const description = section.release ? `Target release: ${section.release}` : '';
        // A milestone closes when every one of its items is ticked.
        const state = section.items.length > 0 && section.items.every((item) => item.done) ? 'closed' : 'open';
        const found = byTitle.get(title);
        if (!found) {
            console.log(`+ milestone ${title} (${state})`);
            const created = DRY_RUN ? { number: -1 } : await api('POST', '/milestones', { title, description, state });
            resolved.set(title, created.number);
            continue;
        }
        resolved.set(title, found.number);
        if (found.description !== description || found.state !== state) {
            console.log(`~ milestone ${title} (${found.state} -> ${state})`);
            if (!DRY_RUN) await api('PATCH', `/milestones/${found.number}`, { description, state });
        }
    }
    return resolved;
}
//
function labelsFor(item) {
    const labels = [BACKLOG_LABEL.name];
    const severity = item.severity ? SEVERITY_LABELS[item.severity]?.name : null;
    if (severity) labels.push(severity);
    return labels;
}
//
function sameLabels(issue, wanted) {
    // Only the labels this script owns are compared, so a label added by hand on
    // the issue is left alone.
    const owned = new Set([BACKLOG_LABEL.name, ...Object.values(SEVERITY_LABELS).map((l) => l.name)]);
    const current = issue.labels.map((label) => label.name).filter((name) => owned.has(name));
    return current.length === wanted.length && wanted.every((name) => current.includes(name));
}
//
async function syncIssues(sections, milestoneNumbers) {
    const issues = (await apiAll('/issues?state=all&labels=backlog')).filter((issue) => !issue.pull_request);
    const byId = new Map();
    for (const issue of issues) {
        const id = /^(NC-\d+):/.exec(issue.title)?.[1];
        if (id) byId.set(id, issue);
    }
    const items = sections.flatMap((section) => section.items);
    let created = 0;
    let updated = 0;
    for (const item of items) {
        const title = titleFor(item);
        const body = bodyFor(item);
        const labels = labelsFor(item);
        const milestone = milestoneNumbers.get(item.milestone) ?? null;
        const state = item.done ? 'closed' : 'open';
        const existing = byId.get(item.id);
        if (!existing) {
            created += 1;
            console.log(`+ issue ${title} [${state}]`);
            if (!DRY_RUN) {
                const issue = await api('POST', '/issues', { title, body, labels, milestone });
                // The create endpoint ignores `state`, so a done item is closed
                // right after.
                if (state === 'closed') await api('PATCH', `/issues/${issue.number}`, { state });
            }
            continue;
        }
        const patch = {};
        if (existing.title !== title) patch.title = title;
        if ((existing.body ?? '').trim() !== body.trim()) patch.body = body;
        if (existing.state !== state) patch.state = state;
        if ((existing.milestone?.number ?? null) !== milestone) patch.milestone = milestone;
        if (!sameLabels(existing, labels)) patch.labels = labels;
        if (Object.keys(patch).length === 0) continue;
        updated += 1;
        console.log(`~ issue #${existing.number} ${item.id} (${Object.keys(patch).join(', ')})`);
        if (!DRY_RUN) await api('PATCH', `/issues/${existing.number}`, patch);
    }
    // An issue whose item disappeared is reported, never touched: ids are never
    // reused, so this means someone deleted an entry by hand.
    const knownIds = new Set(items.map((item) => item.id));
    for (const [id, issue] of byId) {
        if (!knownIds.has(id)) console.warn(`! issue #${issue.number} ${id} has no entry in BACKLOG.md, left untouched`);
    }
    return { created, updated, total: items.length };
}
//
// ------------------------------------------------------------------ main ---
//
async function main() {
    const markdown = await readFile(BACKLOG_PATH, 'utf8');
    const sections = parseBacklog(markdown);
    const items = sections.flatMap((section) => section.items);
    if (items.length === 0) fail('no items parsed — refusing to run against an empty backlog');
    console.log(`backlog-sync: ${items.length} items in ${sections.length} milestones${DRY_RUN ? ' (dry run)' : ''}`);
    for (const section of sections) {
        const done = section.items.filter((item) => item.done).length;
        console.log(`  ${section.key} · ${section.name} — ${done}/${section.items.length} done`);
    }
    if (DRY_RUN && !TOKEN) {
        // Parse-only mode: useful locally, and what the tests exercise.
        for (const item of items) console.log(`  ${item.done ? '[x]' : '[ ]'} ${titleFor(item)}`);
        return;
    }
    if (!REPO) fail('GH_REPO is not set');
    if (!TOKEN) fail('GH_TOKEN is not set');
    const severities = [...new Set(items.map((item) => item.severity).filter(Boolean))];
    if (!DRY_RUN) await ensureLabels(severities);
    const milestoneNumbers = await ensureMilestones(sections);
    const result = await syncIssues(sections, milestoneNumbers);
    console.log(
        `backlog-sync: ${result.total} items — ${result.created} created, ${result.updated} updated${
            DRY_RUN ? ' (dry run, nothing written)' : ''
        }`
    );
}
//
// Importable for the tests without running the sync.
if (process.argv[1] && process.argv[1].endsWith('backlog-sync.mjs')) {
    main().catch((error) => fail(error.message));
}
//
