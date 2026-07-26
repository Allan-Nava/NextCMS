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
