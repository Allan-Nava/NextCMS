/*
 * File: visibility.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Regression tests for the draft leak fixed in v0.8.2 (NC-59): `GET /api/page`
// filtered unpublished content while the page renderer did not, so a draft was
// served publicly at its slug.
//
import { isPubliclyVisible } from '../lib/utils/visibility';
//
const now = new Date('2026-07-26T12:00:00Z');
const past = new Date('2026-07-01T00:00:00Z');
const future = new Date('2026-08-01T00:00:00Z');
//
describe('isPubliclyVisible', () => {
    it('shows published content', () => {
        expect(isPubliclyVisible({ deletedAt: null, publishedAt: past }, now)).toBe(true);
    });

    it('hides a draft', () => {
        expect(isPubliclyVisible({ deletedAt: null, publishedAt: null }, now)).toBe(false);
    });

    it('hides soft-deleted content even when it was published', () => {
        expect(isPubliclyVisible({ deletedAt: past, publishedAt: past }, now)).toBe(false);
    });

    it('hides content published in the future — a scheduled post is not published', () => {
        expect(isPubliclyVisible({ deletedAt: null, publishedAt: future }, now)).toBe(false);
    });

    it('shows content published exactly now', () => {
        expect(isPubliclyVisible({ deletedAt: null, publishedAt: now }, now)).toBe(true);
    });

    it('hides content that is both deleted and a draft', () => {
        expect(isPubliclyVisible({ deletedAt: past, publishedAt: null }, now)).toBe(false);
    });
});
//
