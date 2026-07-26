/*
 * File: feed.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// The Atom feed (NC-84).
//
// Atom rather than RSS 2.0 for one practical reason: RSS requires RFC-822 dates,
// which are locale-sensitive to format by hand and a classic source of feeds that
// break for some readers only. Atom uses RFC 3339, which is `toISOString()`.
//
// Visibility comes from the same predicate as the renderer and the sitemap, so the
// three cannot disagree about what is public (NC-59).
//
import { canonicalUrl } from './seo';
import { VisibilityFields, isPubliclyVisible } from './visibility';
//
// A feed is a window on the recent, not an archive of everything: an unbounded feed
// grows until it is too big to fetch.
export const FEED_LIMIT = 50;
export const FEED_PATH = '/feed.xml';
//
export interface FeedItem extends VisibilityFields {
    slug: string;
    title: string;
    description: string;
    updatedAt: Date;
}
//
export interface FeedOptions {
    baseUrl: string;
    siteName?: string;
    now?: Date;
}
//
function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
//
// Returns null when there is no base URL. Atom requires absolute URLs and a feed is
// read away from the site that served it, so a relative link is not a lesser feed —
// it is a broken one. The caller decides how to report that.
export function buildFeed(items: FeedItem[], options: FeedOptions): string | null {
    const base = canonicalUrl(options.baseUrl, '/');
    if (!base) return null;
    const now = options.now ?? new Date();
    const siteName = options.siteName ?? 'NextCMS';

    const visible = items
        .filter((entry) => isPubliclyVisible(entry, now))
        .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
        .slice(0, FEED_LIMIT);

    // The newest entry, not the current time: a feed whose `updated` moves on every
    // request tells a reader that everything changed, every time.
    const updated = visible[0]?.publishedAt ?? now;

    const entries = visible.map((entry) => {
        const url = escapeXml(canonicalUrl(options.baseUrl, entry.slug) ?? entry.slug);
        return [
            '  <entry>',
            `    <id>${url}</id>`,
            `    <title>${escapeXml(entry.title)}</title>`,
            `    <link href="${url}"/>`,
            `    <updated>${(entry.publishedAt ?? entry.updatedAt).toISOString()}</updated>`,
            `    <summary>${escapeXml(entry.description)}</summary>`,
            '  </entry>',
        ].join('\n');
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        `  <title>${escapeXml(siteName)}</title>`,
        // The id is a permanent identifier for the feed, which is why it is the site
        // root with its trailing slash rather than the feed URL.
        `  <id>${escapeXml(`${base}/`)}</id>`,
        `  <updated>${updated.toISOString()}</updated>`,
        `  <link href="${escapeXml(base)}"/>`,
        `  <link rel="self" href="${escapeXml(`${base}${FEED_PATH}`)}"/>`,
        ...entries,
        '</feed>',
        '',
    ].join('\n');
}
//
