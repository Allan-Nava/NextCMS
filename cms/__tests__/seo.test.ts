/*
 * File: seo.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-60). The editor has stored `seoTitle`,
// `seoDescription` and `jsonld` since the first release and no page ever emitted
// them, so this is the contract for what a page head should contain.
//
import { buildSeo } from '../lib/utils/seo';
//
const published = new Date('2026-07-01T10:00:00Z');
const now = new Date('2026-07-26T12:00:00Z');
//
const page = {
    title: 'About us',
    description: 'Who we are',
    seoTitle: null,
    seoDescription: null,
    slug: '/about',
    type: 'page',
    jsonld: null,
    publishedAt: published,
    updatedAt: published,
};
//
const options = { baseUrl: 'https://example.com', siteName: 'NextCMS', now };
//
describe('title', () => {
    it('prefers seoTitle over the content title', () => {
        expect(buildSeo({ ...page, seoTitle: 'About us — Example' }, options).title).toBe('About us — Example');
    });

    it('falls back to the content title', () => {
        expect(buildSeo(page, options).title).toBe('About us');
    });

    it('treats a blank seoTitle as absent rather than emitting an empty title', () => {
        expect(buildSeo({ ...page, seoTitle: '   ' }, options).title).toBe('About us');
    });
});
//
describe('description', () => {
    it('prefers seoDescription', () => {
        expect(buildSeo({ ...page, seoDescription: 'A short pitch' }, options).description).toBe('A short pitch');
    });

    it('falls back to the content description', () => {
        expect(buildSeo(page, options).description).toBe('Who we are');
    });
});
//
describe('canonical url', () => {
    it('joins the base url and the slug', () => {
        expect(buildSeo(page, options).canonical).toBe('https://example.com/about');
    });

    it('does not double the slash', () => {
        expect(buildSeo(page, { ...options, baseUrl: 'https://example.com/' }).canonical).toBe(
            'https://example.com/about'
        );
    });

    it('keeps the home slug as the bare base url', () => {
        expect(buildSeo({ ...page, slug: '/' }, options).canonical).toBe('https://example.com');
    });

    it('is null when no base url is configured, rather than a relative guess', () => {
        expect(buildSeo(page, { ...options, baseUrl: '' }).canonical).toBeNull();
    });
});
//
describe('robots', () => {
    it('indexes published content', () => {
        expect(buildSeo(page, options).robots).toBe('index,follow');
    });

    it('never indexes a draft', () => {
        expect(buildSeo({ ...page, publishedAt: null }, options).robots).toBe('noindex,nofollow');
    });

    it('never indexes content scheduled for the future', () => {
        const future = new Date('2026-08-15T00:00:00Z');
        expect(buildSeo({ ...page, publishedAt: future }, options).robots).toBe('noindex,nofollow');
    });
});
//
describe('open graph', () => {
    it('describes a page as a website', () => {
        expect(buildSeo(page, options).openGraph.type).toBe('website');
    });

    it('describes a post as an article', () => {
        expect(buildSeo({ ...page, type: 'post' }, options).openGraph.type).toBe('article');
    });

    it('carries the resolved title, description, url and site name', () => {
        const og = buildSeo({ ...page, seoTitle: 'T', seoDescription: 'D' }, options).openGraph;
        expect(og).toMatchObject({
            title: 'T',
            description: 'D',
            url: 'https://example.com/about',
            siteName: 'NextCMS',
        });
    });
});
//
describe('json-ld', () => {
    it('passes through a valid object', () => {
        const jsonld = '{"@context":"https://schema.org","@type":"Article"}';
        expect(buildSeo({ ...page, jsonld }, options).jsonLd).toBe(jsonld);
    });

    it('returns null for malformed json instead of throwing during a render', () => {
        expect(buildSeo({ ...page, jsonld: '{not json' }, options).jsonLd).toBeNull();
    });

    it('rejects json that is not an object or array', () => {
        expect(buildSeo({ ...page, jsonld: '"just a string"' }, options).jsonLd).toBeNull();
        expect(buildSeo({ ...page, jsonld: '42' }, options).jsonLd).toBeNull();
    });

    // This is the security-relevant case: the value is stored by an editor and
    // injected into a <script> tag, so a closing tag inside it would break out
    // of the script and become markup.
    it('escapes a closing script tag so stored json cannot break out of the tag', () => {
        const hostile = '{"@type":"Article","name":"</script><img src=x onerror=alert(1)>"}';
        const output = buildSeo({ ...page, jsonld: hostile }, options).jsonLd;
        expect(output).not.toBeNull();
        expect(output).not.toContain('</script>');
        expect(output).toContain('<\\/script>');
    });

    it('ignores an empty value', () => {
        expect(buildSeo({ ...page, jsonld: '' }, options).jsonLd).toBeNull();
        expect(buildSeo({ ...page, jsonld: '   ' }, options).jsonLd).toBeNull();
    });
});
//
