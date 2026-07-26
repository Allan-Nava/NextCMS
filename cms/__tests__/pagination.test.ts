/*
 * File: pagination.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Written before the implementation (NC-78). Every list endpoint returned its whole
// table, so the page size is the first thing a caller controls — which makes it the
// first thing a caller can abuse. The clamping below is the point of these tests.
//
import { paginationMeta, parsePagination } from '../lib/utils/pagination';
//
describe('parsePagination', () => {
    it('defaults to the first page', () => {
        expect(parsePagination({})).toEqual({ page: 1, perPage: 20, skip: 0, take: 20 });
    });

    it('reads page and perPage', () => {
        expect(parsePagination({ page: '3', perPage: '10' })).toEqual({ page: 3, perPage: 10, skip: 20, take: 10 });
    });

    it('caps perPage so a caller cannot ask for the whole table', () => {
        expect(parsePagination({ perPage: '5000' }).perPage).toBe(100);
    });

    it('refuses a perPage below one', () => {
        expect(parsePagination({ perPage: '0' }).perPage).toBe(20);
        expect(parsePagination({ perPage: '-5' }).perPage).toBe(20);
    });

    it('refuses a page below one', () => {
        expect(parsePagination({ page: '0' }).page).toBe(1);
        expect(parsePagination({ page: '-2' }).page).toBe(1);
    });

    it.each(['abc', '', '   ', '1.5', 'NaN', 'Infinity'])('ignores a non-integer page %p', (page) => {
        expect(parsePagination({ page }).page).toBe(1);
    });

    it('takes the first value of a repeated parameter', () => {
        expect(parsePagination({ page: ['2', '9'] }).page).toBe(2);
    });

    it('computes skip from page and perPage', () => {
        expect(parsePagination({ page: '4', perPage: '25' }).skip).toBe(75);
    });

    it('allows a caller-chosen default', () => {
        expect(parsePagination({}, { defaultPerPage: 50 }).perPage).toBe(50);
    });
});
//
describe('paginationMeta', () => {
    it('reports the totals a client needs to build a pager', () => {
        expect(paginationMeta(45, { page: 2, perPage: 20, skip: 20, take: 20 })).toEqual({
            page: 2,
            perPage: 20,
            total: 45,
            totalPages: 3,
            hasMore: true,
        });
    });

    it('says there is no more on the last page', () => {
        expect(paginationMeta(45, { page: 3, perPage: 20, skip: 40, take: 20 }).hasMore).toBe(false);
    });

    it('reports one page when the result set is empty, not zero', () => {
        // A pager rendering "page 1 of 0" is worse than "page 1 of 1".
        expect(paginationMeta(0, { page: 1, perPage: 20, skip: 0, take: 20 })).toMatchObject({
            total: 0,
            totalPages: 1,
            hasMore: false,
        });
    });

    it('rounds a partial last page up', () => {
        expect(paginationMeta(21, { page: 1, perPage: 20, skip: 0, take: 20 }).totalPages).toBe(2);
    });

    it('says there is no more when the page is past the end', () => {
        expect(paginationMeta(10, { page: 99, perPage: 20, skip: 1960, take: 20 }).hasMore).toBe(false);
    });
});
//
