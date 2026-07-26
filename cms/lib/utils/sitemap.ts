/*
 * File: sitemap.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// `sitemap.xml` and `robots.txt` (NC-69).
//
// Both are pure string builders so the visibility rule can be tested without a
// database. Visibility comes from the same predicate the renderer and the API
// use — a sitemap that advertised drafts would undo NC-59.
//
import { canonicalUrl } from './seo';
import { VisibilityFields, isPubliclyVisible } from './visibility';
//
export interface SitemapEntry extends VisibilityFields {
    slug: string;
    updatedAt: Date;
}
//
export interface SitemapOptions {
    baseUrl: string;
    now?: Date;
}
//
// An unescaped ampersand makes the whole document unparseable, so a single bad
// slug would take the sitemap down rather than just its own entry.
function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
//
function isoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}
//
export function buildSitemap(entries: SitemapEntry[], options: SitemapOptions): string {
    const now = options.now ?? new Date();
    const urls = entries
        .filter((entry) => isPubliclyVisible(entry, now))
        // Sorted so the document is byte-stable between requests: a sitemap that
        // reshuffles on every fetch looks like churn to a crawler.
        .sort((a, b) => a.slug.localeCompare(b.slug))
        .map((entry) => {
            const loc = escapeXml(canonicalUrl(options.baseUrl, entry.slug) ?? entry.slug);
            return ['  <url>', `    <loc>${loc}</loc>`, `    <lastmod>${isoDate(entry.updatedAt)}</lastmod>`, '  </url>'].join(
                '\n'
            );
        });
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n');
}
//
// The editor screens and the API are not content: they are behind auth anyway,
// but keeping crawlers out of them saves pointless 401s in the logs.
const DISALLOWED = ['/api/', '/content', '/page-builder', '/profile', '/login', '/forgot-password', '/reset-password'];
//
export function buildRobots(options: { baseUrl: string }): string {
    const lines = ['User-agent: *', 'Allow: /', ...DISALLOWED.map((path) => `Disallow: ${path}`)];
    const sitemap = canonicalUrl(options.baseUrl, '/sitemap.xml');
    // No base url means no absolute sitemap url, and a relative one is invalid
    // here — better to omit the line than to publish a broken pointer.
    if (sitemap) lines.push('', `Sitemap: ${sitemap}`);
    return `${lines.join('\n')}\n`;
}
//
