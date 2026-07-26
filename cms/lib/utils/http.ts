/*
 * File: http.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Shared response helpers, so every route answers the same way (NC-14, NC-16).
//
// Two rules the API routes must respect:
//   1. every branch answers — a handler that returns without writing leaves the
//      request hanging until the client times out;
//   2. an unsupported method is a 405 with an `Allow` header, never a thrown
//      error (which Next turns into an opaque 500).
//
import type { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse } from '../types/response/response';
import { logger } from './logger';
//
export function methodNotAllowed(req: NextApiRequest, res: NextApiResponse, allowed: string[]): void {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json(errorResponse({ error: `method ${req.method} not allowed` }));
}
//
export function badRequest(res: NextApiResponse, message: string): void {
    res.status(400).json(errorResponse({ error: message }));
}
//
export function notFound(res: NextApiResponse, message = 'not found'): void {
    res.status(404).json(errorResponse({ error: message }));
}
//
// Never leaks the underlying error to the client: the details go to the log,
// the caller gets a generic 500.
export function serverError(res: NextApiResponse, context: string, error: unknown): void {
    logger.error(`${context} failed`, { reason: error instanceof Error ? error.message : String(error) });
    res.status(500).json(errorResponse({ error: 'internal server error' }));
}
//
// Route params arrive as `string | string[] | undefined`, and the previous code
// read them from `req.body` on GET requests — where there is no body — so every
// lookup ended up as `parseInt(undefined)` = NaN (NC-15).
export function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined || raw.trim() === '') return null;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}
//
