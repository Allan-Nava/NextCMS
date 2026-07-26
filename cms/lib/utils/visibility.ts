/*
 * File: visibility.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// The one predicate that decides whether a piece of content may be shown to an
// anonymous visitor (NC-59).
//
// It lives in its own module, free of Prisma, for two reasons: it is the rule a
// draft leak would slip through, so it deserves a unit test; and having it in one
// place stops the API and the renderer from disagreeing — which is exactly what
// happened in v0.8.0, where `GET /api/page` filtered drafts and the page renderer
// did not.
//
export interface VisibilityFields {
    deletedAt: Date | null;
    publishedAt: Date | null;
}
//
export function isPubliclyVisible(content: VisibilityFields, now: Date = new Date()): boolean {
    if (content.deletedAt !== null) return false;
    if (content.publishedAt === null) return false;
    // A future publish date is a scheduled post, not a published one.
    return content.publishedAt.getTime() <= now.getTime();
}
//
