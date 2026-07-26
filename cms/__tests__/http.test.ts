/*
 * File: http.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// `parseId` is the fix for NC-15: route ids used to be read from `req.body` on
// GET requests, so every lookup became parseInt(undefined) = NaN.
//
import { parseId } from '../lib/utils/http';
import { slugFromSegments } from '../lib/utils/slug';
//
describe('parseId', () => {
    it('accepts a positive integer', () => {
        expect(parseId('42')).toBe(42);
    });

    it('takes the first value of a repeated query param', () => {
        expect(parseId(['7', '9'])).toBe(7);
    });

    it.each([undefined, '', '   ', 'abc', '0', '-3', '1.5', 'NaN'])('rejects %p', (input) => {
        expect(parseId(input as string | undefined)).toBeNull();
    });
});
//
describe('slugFromSegments', () => {
    it('maps no segments to the home slug', () => {
        expect(slugFromSegments(undefined)).toBe('/');
        expect(slugFromSegments([])).toBe('/');
    });

    it('joins nested segments', () => {
        expect(slugFromSegments(['blog', 'hello-world'])).toBe('/blog/hello-world');
    });

    it('accepts a single string segment', () => {
        expect(slugFromSegments('about')).toBe('/about');
    });

    it('drops empty segments', () => {
        expect(slugFromSegments(['blog', '', 'post'])).toBe('/blog/post');
    });
});
//
