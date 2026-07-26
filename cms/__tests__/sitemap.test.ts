/*
 * File: sitemap.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-69). Two properties matter more than the
// exact formatting: a draft must never appear in the sitemap, and a slug must be
// XML-escaped — an unescaped ampersand makes the whole document unparseable, so
// one bad slug would take the sitemap down rather than just its own entry.
//
import { buildRobots, buildSitemap } from '../lib/utils/sitemap';
//
const now = new Date('2026-07-26T12:00:00Z');
const published = new Date('2026-07-01T10:00:00Z');
const future = new Date('2026-08-15T00:00:00Z');
//
const entry = (over: Partial<Parameters<typeof buildSitemap>[0][number]> = {}) => ({
    slug: '/about',
    updatedAt: published,
    publishedAt: published,
    deletedAt: null,
    ...over,
});
//
describe('buildSitemap', () => {
    it('emits a urlset with one url per visible entry', () => {
        const xml = buildSitemap([entry(), entry({ slug: '/contact' })], { baseUrl: 'https://example.com', now });
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
        expect(xml.match(/<url>/g)).toHaveLength(2);
        expect(xml).toContain('<loc>https://example.com/about</loc>');
        expect(xml).toContain('<loc>https://example.com/contact</loc>');
    });

    it('omits drafts', () => {
        const xml = buildSitemap([entry({ slug: '/draft', publishedAt: null }), entry()], {
            baseUrl: 'https://example.com',
            now,
        });
        expect(xml).not.toContain('/draft');
        expect(xml.match(/<url>/g)).toHaveLength(1);
    });

    it('omits content scheduled for the future', () => {
        const xml = buildSitemap([entry({ slug: '/soon', publishedAt: future })], {
            baseUrl: 'https://example.com',
            now,
        });
        expect(xml).not.toContain('/soon');
    });

    it('omits soft-deleted content', () => {
        const xml = buildSitemap([entry({ slug: '/gone', deletedAt: published })], {
            baseUrl: 'https://example.com',
            now,
        });
        expect(xml).not.toContain('/gone');
    });

    it('escapes XML-significant characters in a slug', () => {
        const xml = buildSitemap([entry({ slug: '/a&b' })], { baseUrl: 'https://example.com', now });
        expect(xml).toContain('<loc>https://example.com/a&amp;b</loc>');
        expect(xml).not.toMatch(/<loc>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)/);
    });

    it('emits lastmod as a date', () => {
        const xml = buildSitemap([entry()], { baseUrl: 'https://example.com', now });
        expect(xml).toContain('<lastmod>2026-07-01</lastmod>');
    });

    it('renders the home slug as the bare base url', () => {
        const xml = buildSitemap([entry({ slug: '/' })], { baseUrl: 'https://example.com', now });
        expect(xml).toContain('<loc>https://example.com</loc>');
    });

    it('is a valid empty document when nothing is visible', () => {
        const xml = buildSitemap([], { baseUrl: 'https://example.com', now });
        expect(xml).toContain('<urlset');
        expect(xml).toContain('</urlset>');
        expect(xml).not.toContain('<url>');
    });

    it('orders entries by slug so the output is deterministic', () => {
        const xml = buildSitemap([entry({ slug: '/zebra' }), entry({ slug: '/alpha' })], {
            baseUrl: 'https://example.com',
            now,
        });
        expect(xml.indexOf('/alpha')).toBeLessThan(xml.indexOf('/zebra'));
    });
});
//
describe('buildRobots', () => {
    it('allows crawlers by default', () => {
        const robots = buildRobots({ baseUrl: 'https://example.com' });
        expect(robots).toContain('User-agent: *');
        expect(robots).toContain('Allow: /');
    });

    it('keeps crawlers out of the editor and the API', () => {
        const robots = buildRobots({ baseUrl: 'https://example.com' });
        for (const path of ['/api/', '/content', '/page-builder', '/profile', '/login']) {
            expect(robots).toContain(`Disallow: ${path}`);
        }
    });

    it('points at the sitemap when the base url is known', () => {
        expect(buildRobots({ baseUrl: 'https://example.com' })).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('omits the sitemap line rather than emitting a broken url', () => {
        expect(buildRobots({ baseUrl: '' })).not.toContain('Sitemap:');
    });

    it('ends with a newline, as the format expects', () => {
        expect(buildRobots({ baseUrl: 'https://example.com' }).endsWith('\n')).toBe(true);
    });
});
//
