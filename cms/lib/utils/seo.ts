/*
 * File: seo.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Builds the metadata for a content page's head (NC-60).
//
// The editor has stored `seoTitle`, `seoDescription` and `jsonld` since the first
// release and nothing ever emitted them: public pages shipped no title, no
// description and no structured data. This is the pure part — the React side is
// `components/Seo.tsx`.
//
import { isPubliclyVisible } from './visibility';
//
export interface SeoInput {
    title: string;
    description: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    slug: string;
    type: string;
    jsonld?: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
}
//
export interface SeoOptions {
    baseUrl?: string;
    siteName?: string;
    now?: Date;
}
//
export interface SeoMetadata {
    title: string;
    description: string;
    canonical: string | null;
    robots: string;
    jsonLd: string | null;
    openGraph: {
        type: string;
        title: string;
        description: string;
        url: string | null;
        siteName: string | null;
    };
}
//
// A stored value that is present but blank is the same as absent: emitting an
// empty <title> would be worse than falling back.
function preferred(override: string | null | undefined, fallback: string): string {
    return override !== null && override !== undefined && override.trim().length > 0 ? override : fallback;
}
//
export function canonicalUrl(baseUrl: string | undefined, slug: string): string | null {
    if (!baseUrl || baseUrl.trim().length === 0) return null;
    const base = baseUrl.replace(/\/+$/, '');
    if (slug === '/' || slug === '') return base;
    return `${base}/${slug.replace(/^\/+/, '')}`;
}
//
// JSON-LD is stored by an editor and injected into a <script> tag. Two guards:
// it must parse to an object or array, and any closing tag inside it is escaped —
// otherwise `</script>` in a stored string ends the script element and whatever
// follows becomes live markup.
export function safeJsonLd(raw: string | null | undefined): string | null {
    if (!raw || raw.trim().length === 0) return null;
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    if (typeof parsed !== 'object' || parsed === null) return null;
    return raw.replace(/<\//g, '<\\/');
}
//
export function buildSeo(input: SeoInput, options: SeoOptions = {}): SeoMetadata {
    const now = options.now ?? new Date();
    const title = preferred(input.seoTitle, input.title);
    const description = preferred(input.seoDescription, input.description);
    const canonical = canonicalUrl(options.baseUrl, input.slug);
    // A draft rendered through the preview must never invite indexing, so the
    // robots value is derived from the same predicate the renderer uses.
    const visible = isPubliclyVisible({ deletedAt: null, publishedAt: input.publishedAt }, now);
    return {
        title,
        description,
        canonical,
        robots: visible ? 'index,follow' : 'noindex,nofollow',
        jsonLd: safeJsonLd(input.jsonld),
        openGraph: {
            type: input.type === 'post' ? 'article' : 'website',
            title,
            description,
            url: canonical,
            siteName: options.siteName ?? null,
        },
    };
}
//
