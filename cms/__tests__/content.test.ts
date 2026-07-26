/*
 * File: content.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Content management and layout persistence (NC-41, NC-42). Two things are worth
// pinning here: a slug derived from a name must stay a usable unique key, and a
// layout must never be accepted with a component the renderer cannot draw.
//
import { slugify } from '../lib/utils/slug';
import { validateLayoutPayload, validateTaxonomyPayload } from '../lib/utils/validation';
import { registeredComponentPaths } from '../components/registry';
//
describe('slugify', () => {
    it('lowercases and joins words with dashes', () => {
        expect(slugify('Breaking News')).toBe('breaking-news');
    });

    it('strips accents instead of dropping the letter', () => {
        expect(slugify('Attualità')).toBe('attualita');
        expect(slugify('Ötzi Öland')).toBe('otzi-oland');
    });

    it('collapses runs of punctuation into a single dash', () => {
        expect(slugify('news -- and //  views!')).toBe('news-and-views');
    });

    it('does not leave leading or trailing dashes', () => {
        expect(slugify('  ...hello...  ')).toBe('hello');
    });

    it('never returns an empty string, which could not be a unique key', () => {
        expect(slugify('!!!')).toBe('untitled');
        expect(slugify('')).toBe('untitled');
    });

    it('is stable: slugifying a slug returns the same slug', () => {
        const once = slugify('Attualità & Politica');
        expect(slugify(once)).toBe(once);
    });
});
//
describe('validateTaxonomyPayload', () => {
    it('requires a name', () => {
        expect(validateTaxonomyPayload({})).toEqual(['name is required']);
        expect(validateTaxonomyPayload({ name: 'News' })).toEqual([]);
    });

    it('accepts an explicit slug but rejects an empty one', () => {
        expect(validateTaxonomyPayload({ name: 'News', slug: 'news' })).toEqual([]);
        expect(validateTaxonomyPayload({ name: 'News', slug: '' })).toEqual(['slug must be a non-empty string']);
    });
});
//
describe('validateLayoutPayload', () => {
    const known = registeredComponentPaths()[0];

    it('accepts an empty layout — a page may have no blocks', () => {
        expect(validateLayoutPayload({ components: [] })).toEqual([]);
    });

    it('accepts blocks that point at registered components', () => {
        expect(validateLayoutPayload({ components: [{ name: 'Hero', path: known }] })).toEqual([]);
    });

    it('rejects a body without a components array', () => {
        expect(validateLayoutPayload({})).toEqual(['components must be an array']);
        expect(validateLayoutPayload({ components: 'nope' })).toEqual(['components must be an array']);
    });

    it('rejects a path the renderer could not draw', () => {
        const errors = validateLayoutPayload({ components: [{ name: 'X', path: './Elements/DoesNotExist' }] });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('not a registered component');
    });

    it('reports the index of each bad block', () => {
        const errors = validateLayoutPayload({
            components: [{ name: 'ok', path: known }, { path: known }, { name: 'bad', path: '../../etc/passwd' }],
        });
        expect(errors).toContain('components[1].name is required');
        expect(errors.some((error) => error.startsWith('components[2].path'))).toBe(true);
    });

    it('rejects props that are not an object', () => {
        expect(validateLayoutPayload({ components: [{ name: 'a', path: known, props: [] }] })).toContain(
            'components[0].props must be an object'
        );
        expect(validateLayoutPayload({ components: [{ name: 'a', path: known, props: { title: 'x' } }] })).toEqual([]);
    });
});
//
