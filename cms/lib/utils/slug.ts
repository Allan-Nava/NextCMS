/*
 * File: slug.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Route segments -> page slug (NC-18).
//
// Kept free of any Prisma import so it stays unit-testable. The catch-all route
// used to derive the slug from `context.req.url`, which carries the query
// string, so `/about?ref=x` never matched the stored `/about`.
//
export function slugFromSegments(segments: string | string[] | undefined): string {
    if (segments === undefined) return '/';
    const parts = Array.isArray(segments) ? segments : [segments];
    const joined = parts.filter((part) => typeof part === 'string' && part.length > 0).join('/');
    return joined.length === 0 ? '/' : `/${joined}`;
}
//
// Name -> url-safe slug, for categories and tags (NC-41). Accented characters
// are decomposed rather than dropped, so "Attualità" becomes "attualita" and not
// "attualit".
export function slugify(value: string): string {
    const slug = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    // A name made only of symbols would collapse to an empty string, which is
    // not a usable unique key.
    return slug.length > 0 ? slug : 'untitled';
}
//
