/*
 * File: redirect.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-54). The admin panel sends a logged-out
// visitor here as `/login?next=/admin/users`, so `next` is attacker-controlled and
// this is an open-redirect surface.
//
// The rule: a same-origin path is fine, and one absolute origin is allowed — the
// configured admin app, because in development it lives on another port and the
// round trip would otherwise be impossible. Everything else is refused.
//
import { safeRedirectTarget } from '../lib/utils/redirect';
//
describe('same-origin paths', () => {
    it('accepts a plain path', () => {
        expect(safeRedirectTarget('/admin/users', {})).toBe('/admin/users');
    });

    it('keeps the query string', () => {
        expect(safeRedirectTarget('/content?type=post', {})).toBe('/content?type=post');
    });

    it('defaults to the home page when there is nothing to honour', () => {
        expect(safeRedirectTarget(undefined, {})).toBe('/');
        expect(safeRedirectTarget('', {})).toBe('/');
        expect(safeRedirectTarget('   ', {})).toBe('/');
    });
});
//
describe('refuses anything that could leave the site', () => {
    it.each([
        'https://evil.example/phish',
        '//evil.example',
        'http://evil.example',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '/\\evil.example',
        'admin/users',
    ])('refuses %p', (input) => {
        expect(safeRedirectTarget(input, {})).toBe('/');
    });

    it('refuses a value that is not a string', () => {
        expect(safeRedirectTarget(['/a', '/b'] as unknown as string, {})).toBe('/');
    });
});
//
describe('the configured admin origin is allowed', () => {
    const options = { adminOrigin: 'http://localhost:4000' };

    it('accepts an absolute url on that origin', () => {
        expect(safeRedirectTarget('http://localhost:4000/admin/users', options)).toBe(
            'http://localhost:4000/admin/users'
        );
    });

    it('accepts the origin itself', () => {
        expect(safeRedirectTarget('http://localhost:4000', options)).toBe('http://localhost:4000');
    });

    it('still refuses a different origin', () => {
        expect(safeRedirectTarget('http://localhost:4001/admin', options)).toBe('/');
        expect(safeRedirectTarget('https://localhost:4000/admin', options)).toBe('/');
    });

    // The classic bypass: a host that merely starts with the allowed one.
    it('refuses a host that only looks like the allowed origin', () => {
        expect(safeRedirectTarget('http://localhost:4000.evil.example/admin', options)).toBe('/');
        expect(safeRedirectTarget('http://localhost:40000/admin', options)).toBe('/');
    });

    it('refuses credentials smuggled into the authority', () => {
        expect(safeRedirectTarget('http://localhost:4000@evil.example/', options)).toBe('/');
    });
});
//
