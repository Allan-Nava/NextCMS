/*
 * File: pagination.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Offset pagination for the list endpoints (NC-78).
//
// Before this, all eleven `findMany` calls in the repo layer ran without a limit:
// every list endpoint returned its whole table and the admin screens rendered all
// of it. Invisible with twenty rows, a denial of service with twenty thousand.
//
// Offset rather than cursor: the admin needs page numbers and a total, the tables
// are small, and a cursor cannot answer "page 7 of 12". If a collection ever grows
// past what `OFFSET` handles well, that collection gets a cursor — not all of them.
//
export const DEFAULT_PER_PAGE = 20;
// The cap is the point: it is what stops `?perPage=100000` from being the same
// request as the unbounded one this replaced.
export const MAX_PER_PAGE = 100;
//
export interface Pagination {
    page: number;
    perPage: number;
    skip: number;
    take: number;
}
//
export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}
//
type QueryValue = string | string[] | undefined;
//
// Only a positive integer counts. Anything else — a float, a word, an empty
// string, `Infinity` — falls back to the default rather than becoming NaN and
// reaching the database.
function positiveInt(value: QueryValue): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined) return null;
    const trimmed = raw.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
//
export function parsePagination(
    query: Record<string, QueryValue>,
    options: { defaultPerPage?: number } = {}
): Pagination {
    const page = positiveInt(query.page) ?? 1;
    const requested = positiveInt(query.perPage) ?? options.defaultPerPage ?? DEFAULT_PER_PAGE;
    const perPage = Math.min(requested, MAX_PER_PAGE);
    return { page, perPage, skip: (page - 1) * perPage, take: perPage };
}
//
export function paginationMeta(total: number, pagination: Pagination): PaginationMeta {
    // One page rather than zero when empty: a pager rendering "page 1 of 0" is
    // worse than "page 1 of 1".
    const totalPages = Math.max(1, Math.ceil(total / pagination.perPage));
    return {
        page: pagination.page,
        perPage: pagination.perPage,
        total,
        totalPages,
        hasMore: pagination.skip + pagination.perPage < total,
    };
}
//
