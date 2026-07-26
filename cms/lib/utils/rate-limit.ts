/*
 * File: rate-limit.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Fixed-window rate limiter for the authentication endpoints (NC-53). Without
// it the only thing slowing down credential stuffing is bcrypt.
//
// LIMITATION: the counters live in this process's memory. Behind several
// instances the effective limit is per instance, and a restart clears it. That
// is enough for a single-node deployment; a shared store (Redis) is the next
// step if the app is ever scaled out.
//
import type { NextApiRequest } from 'next';
//
export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}
//
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}
//
interface Bucket {
    count: number;
    resetAt: number;
}
//
const buckets = new Map<string, Bucket>();
//
// Entries are swept opportunistically so the map cannot grow without bound when
// an attacker rotates keys.
function sweep(now: number): void {
    if (buckets.size < 1000) return;
    buckets.forEach((bucket, key) => {
        if (bucket.resetAt <= now) buckets.delete(key);
    });
}
//
export function rateLimit(key: string, options: RateLimitOptions, now = Date.now()): RateLimitResult {
    sweep(now);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
    }
    bucket.count += 1;
    if (bucket.count > options.limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
    }
    return { allowed: true, remaining: options.limit - bucket.count, retryAfterSeconds: 0 };
}
//
// Exposed for the tests: the counters are module state, so a test that wants a
// clean slate has to say so.
export function resetRateLimits(): void {
    buckets.clear();
}
//
// First hop of X-Forwarded-For when present — behind a proxy the socket address
// is the proxy's. Trust it only because the app is expected to sit behind one;
// a client-supplied header cannot be trusted for anything but bucketing.
export function clientIp(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (raw) {
        const first = raw.split(',')[0]?.trim();
        if (first) return first;
    }
    return req.socket?.remoteAddress ?? 'unknown';
}
//
