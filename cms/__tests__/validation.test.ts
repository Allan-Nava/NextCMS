/*
 * File: validation.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Payload validation (NC-8): request bodies used to go straight to Prisma, so a
// missing field surfaced as a 500 from the driver instead of a 400.
//
import { validateComponentPayload, validatePagePayload, validateUserPayload } from '../lib/utils/validation';
//
describe('validateUserPayload', () => {
    const valid = {
        username: 'editor',
        email: 'editor@example.com',
        password: 'a-long-enough-password',
        firstName: 'Ed',
        lastName: 'Itor',
    };

    it('accepts a complete payload', () => {
        expect(validateUserPayload(valid, { requirePassword: true })).toEqual([]);
    });

    it('rejects an empty body rather than letting it reach the database', () => {
        expect(validateUserPayload(undefined, { requirePassword: true }).length).toBeGreaterThan(0);
    });

    it('rejects a malformed email', () => {
        expect(validateUserPayload({ ...valid, email: 'not-an-email' }, { requirePassword: true })).toContain(
            'a valid email is required'
        );
    });

    it('rejects a short password', () => {
        expect(validateUserPayload({ ...valid, password: 'short' }, { requirePassword: true })).toEqual([
            'password must be at least 10 characters',
        ]);
    });

    it('allows omitting the password on a partial update', () => {
        const { password, ...withoutPassword } = valid;
        expect(validateUserPayload(withoutPassword, { requirePassword: false })).toEqual([]);
    });

    it('still validates a password that is present on an update', () => {
        expect(validateUserPayload({ ...valid, password: 'x' }, { requirePassword: false }).length).toBe(1);
    });
});
//
describe('validatePagePayload', () => {
    const valid = { title: 'Home', description: 'the home page', slug: '/' };

    it('accepts a complete payload', () => {
        expect(validatePagePayload(valid)).toEqual([]);
    });

    it('requires the slug to start with a slash', () => {
        expect(validatePagePayload({ ...valid, slug: 'home' })).toContain('slug is required and must start with "/"');
    });

    it('reports every problem at once', () => {
        expect(validatePagePayload({}).length).toBe(3);
    });
});
//
describe('validateComponentPayload', () => {
    it('requires name and path', () => {
        expect(validateComponentPayload({})).toEqual(['name is required', 'path is required']);
        expect(validateComponentPayload({ name: 'Hero', path: './Elements/Hero' })).toEqual([]);
    });
});
//
