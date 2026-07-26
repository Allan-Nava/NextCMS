/*
 * File: feed.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-84).
//
// Atom rather than RSS 2.0: RSS requires RFC-822 dates, which are locale-sensitive
// to format by hand and a classic source of feeds that only break for some readers.
// Atom uses RFC 3339, which is `toISOString()`.
//
// Two properties matter more than the markup: a draft must never appear — the same
// rule as the sitemap — and every URL must be absolute, because a feed is read
// away from the site that served it.
//
import { buildFeed } from '../lib/utils/feed';
//
const now = new Date('2026-07-26T12:00:00Z');
const published = new Date('2026-07-01T10:00:00Z');
const older = new Date('2026-06-01T10:00:00Z');
const future = new Date('2026-08-15T00:00:00Z');
//
const item = (over: Partial<Parameters<typeof buildFeed>[0][number]> = {}) => ({
    slug: '/hello',
    title: 'Hello',
    description: 'A first post',
    publishedAt: published,
    updatedAt: published,
    deletedAt: null,
    ...over,
});
//
const options = { baseUrl: 'https://example.com', siteName: 'NextCMS', now };
//
describe('feed document', () => {
    it('is an Atom feed with the required channel fields', () => {
        const xml = buildFeed([item()], options) as string;
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
        expect(xml).toContain('<title>NextCMS</title>');
        expect(xml).toContain('<id>https://example.com/</id>');
        expect(xml).toContain('<link rel="self" href="https://example.com/feed.xml"/>');
        expect(xml).toContain('<link href="https://example.com"/>');
        expect(xml).toContain('</feed>');
    });

    it('stamps the feed with the newest entry date, not the current time', () => {
        // A feed whose `updated` moves on every request tells a reader everything
        // changed, every time.
        const xml = buildFeed([item({ publishedAt: older }), item({ slug: '/b', publishedAt: published })], options) as string;
        expect(xml).toContain(`<updated>${published.toISOString()}</updated>`);
    });

    it('falls back to the current time when there is nothing to publish', () => {
        const xml = buildFeed([], options) as string;
        expect(xml).toContain(`<updated>${now.toISOString()}</updated>`);
        expect(xml).not.toContain('<entry>');
    });

    it('refuses to build without a base url, rather than emitting relative links', () => {
        // Atom requires absolute URLs, and a feed is read away from the site that
        // served it: a relative link is not a lesser feed, it is a broken one.
        expect(buildFeed([item()], { ...options, baseUrl: '' })).toBeNull();
    });
});
//
describe('entries', () => {
    it('carries an absolute id, link, title, date and summary', () => {
        const xml = buildFeed([item()], options) as string;
        expect(xml).toContain('<id>https://example.com/hello</id>');
        expect(xml).toContain('<link href="https://example.com/hello"/>');
        expect(xml).toContain('<title>Hello</title>');
        expect(xml).toContain(`<updated>${published.toISOString()}</updated>`);
        expect(xml).toContain('<summary>A first post</summary>');
    });

    it('lists newest first', () => {
        const xml = buildFeed(
            [item({ slug: '/old', title: 'Old', publishedAt: older }), item({ slug: '/new', title: 'New' })],
            options
        ) as string;
        expect(xml.indexOf('/new')).toBeLessThan(xml.indexOf('/old'));
    });

    it('caps how many entries it emits', () => {
        const many = Array.from({ length: 80 }, (_, index) => item({ slug: `/post-${index}` }));
        const xml = buildFeed(many, options) as string;
        expect((xml.match(/<entry>/g) ?? []).length).toBe(50);
    });
});
//
describe('what must never appear', () => {
    it('omits drafts', () => {
        const xml = buildFeed([item({ slug: '/draft', publishedAt: null }), item()], options) as string;
        expect(xml).not.toContain('/draft');
        expect((xml.match(/<entry>/g) ?? []).length).toBe(1);
    });

    it('omits content scheduled for the future', () => {
        const xml = buildFeed([item({ slug: '/soon', publishedAt: future })], options) as string;
        expect(xml).not.toContain('/soon');
    });

    it('omits soft-deleted content', () => {
        const xml = buildFeed([item({ slug: '/gone', deletedAt: published })], options) as string;
        expect(xml).not.toContain('/gone');
    });
});
//
describe('escaping', () => {
    it('escapes XML-significant characters in a title', () => {
        const xml = buildFeed([item({ title: 'Cats & dogs <b>rule</b>' })], options) as string;
        expect(xml).toContain('<title>Cats &amp; dogs &lt;b&gt;rule&lt;/b&gt;</title>');
    });

    it('escapes them in a summary and in a slug', () => {
        const xml = buildFeed([item({ slug: '/a&b', description: 'x "y" & z' })], options) as string;
        expect(xml).toContain('https://example.com/a&amp;b');
        expect(xml).toContain('<summary>x &quot;y&quot; &amp; z</summary>');
    });

    it('leaves no unescaped ampersand anywhere, which would make the document unparseable', () => {
        const xml = buildFeed([item({ title: 'A & B', slug: '/a&b', description: 'C & D' })], options) as string;
        expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    });
});
//
