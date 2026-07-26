/*
 * File: rate-limit.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// The rate limiter guards login and registration (NC-53), so its edges matter:
// the limit must actually bite, the window must reopen, and two different
// clients must not share a bucket.
//
import type { NextApiRequest } from 'next';
import { clientIp, rateLimit, resetRateLimits } from '../lib/utils/rate-limit';
//
const options = { limit: 3, windowMs: 60_000 };
//
beforeEach(() => resetRateLimits());
//
describe('rateLimit', () => {
    it('allows requests up to the limit and refuses the next one', () => {
        const now = 1_000_000;
        expect(rateLimit('k', options, now).allowed).toBe(true);
        expect(rateLimit('k', options, now).allowed).toBe(true);
        expect(rateLimit('k', options, now).allowed).toBe(true);
        expect(rateLimit('k', options, now).allowed).toBe(false);
    });

    it('reports how long the caller must wait', () => {
        const now = 1_000_000;
        for (let i = 0; i < options.limit; i += 1) rateLimit('k', options, now);
        const refused = rateLimit('k', options, now + 15_000);
        expect(refused.allowed).toBe(false);
        expect(refused.retryAfterSeconds).toBe(45);
    });

    it('reopens once the window has passed', () => {
        const now = 1_000_000;
        for (let i = 0; i < options.limit; i += 1) rateLimit('k', options, now);
        expect(rateLimit('k', options, now).allowed).toBe(false);
        expect(rateLimit('k', options, now + options.windowMs + 1).allowed).toBe(true);
    });

    it('keeps separate buckets per key', () => {
        const now = 1_000_000;
        for (let i = 0; i < options.limit; i += 1) rateLimit('first', options, now);
        expect(rateLimit('first', options, now).allowed).toBe(false);
        expect(rateLimit('second', options, now).allowed).toBe(true);
    });

    it('counts down the remaining allowance', () => {
        const now = 1_000_000;
        expect(rateLimit('k', options, now).remaining).toBe(2);
        expect(rateLimit('k', options, now).remaining).toBe(1);
        expect(rateLimit('k', options, now).remaining).toBe(0);
    });
});
//
describe('clientIp', () => {
    const req = (headers: Record<string, string | string[]>, remote?: string) =>
        ({ headers, socket: { remoteAddress: remote } }) as unknown as NextApiRequest;

    it('takes the first hop of X-Forwarded-For', () => {
        expect(clientIp(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
    });

    it('falls back to the socket address', () => {
        expect(clientIp(req({}, '198.51.100.4'))).toBe('198.51.100.4');
    });

    it('never returns undefined', () => {
        expect(clientIp(req({}))).toBe('unknown');
    });
});
//
