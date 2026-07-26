/*
 * File: session.test.ts
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-54). The admin panel has no login of its
// own: it sends an unauthenticated visitor to the cms login screen and comes back.
// That return trip is an open-redirect if the target is not validated, which is
// the property most of these tests are about.
//
import { apiPath, loginRedirect, safeReturnTo } from '../lib/utils/session';
//
describe('loginRedirect', () => {
    it('points at the cms login and carries the path to return to', () => {
        expect(loginRedirect({ cmsOrigin: 'https://example.com', returnTo: '/admin/users' })).toBe(
            'https://example.com/login?next=%2Fadmin%2Fusers'
        );
    });

    it('does not double the slash when the origin has a trailing one', () => {
        expect(loginRedirect({ cmsOrigin: 'https://example.com/', returnTo: '/admin' })).toBe(
            'https://example.com/login?next=%2Fadmin'
        );
    });

    it('falls back to a relative login path when no origin is configured', () => {
        // Better a same-origin 404 the operator will notice than a link to
        // nowhere built from an empty string.
        expect(loginRedirect({ cmsOrigin: '', returnTo: '/admin' })).toBe('/login?next=%2Fadmin');
    });
});
//
describe('safeReturnTo', () => {
    it('keeps an absolute path within the site', () => {
        expect(safeReturnTo('/admin/users')).toBe('/admin/users');
    });

    it('keeps a query string', () => {
        expect(safeReturnTo('/admin/content?type=post')).toBe('/admin/content?type=post');
    });

    // The open-redirect cases: a returnTo comes from the URL, so it is attacker
    // controlled. Anything that could leave the site becomes the default.
    it.each([
        'https://evil.example/phish',
        '//evil.example/phish',
        'http://evil.example',
        'javascript:alert(1)',
        '/\\evil.example',
        '',
        '   ',
    ])('refuses %p and falls back to the admin root', (input) => {
        expect(safeReturnTo(input)).toBe('/admin');
    });

    it('refuses a value that is not a string at all', () => {
        expect(safeReturnTo(undefined)).toBe('/admin');
        expect(safeReturnTo(['/a', '/b'] as unknown as string)).toBe('/admin');
    });
});
//
describe('apiPath', () => {
    // Same-origin on purpose: the browser talks to the admin app, which proxies to
    // the cms API server-side, so the HttpOnly cookie travels and no CORS or
    // token-in-localStorage is needed.
    it('builds a same-origin proxy path', () => {
        expect(apiPath('user')).toBe('/admin/api/user');
    });

    it('accepts a path with or without a leading slash', () => {
        expect(apiPath('/user')).toBe('/admin/api/user');
    });

    it('keeps nested segments', () => {
        expect(apiPath('page/12/layout')).toBe('/admin/api/page/12/layout');
    });

    it('encodes query parameters', () => {
        expect(apiPath('page', { type: 'post', tag: 'a b' })).toBe('/admin/api/page?type=post&tag=a+b');
    });

    it('drops empty parameters rather than sending blanks', () => {
        expect(apiPath('page', { type: '', category: undefined, tag: 'x' })).toBe('/admin/api/page?tag=x');
    });
});
//
