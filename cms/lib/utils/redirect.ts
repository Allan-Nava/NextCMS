/*
 * File: redirect.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Validates a post-login redirect target (NC-54).
//
// The admin panel sends a logged-out visitor here as `/login?next=/admin/users`,
// so `next` arrives from the URL and is attacker-controlled. Two things are
// allowed and nothing else:
//
//   - a same-origin path, and
//   - an absolute URL on the configured admin origin, because in development the
//     panel runs on another port and the round trip is otherwise impossible.
//
export interface RedirectOptions {
    adminOrigin?: string;
}
//
const FALLBACK = '/';
//
export function safeRedirectTarget(value: string | undefined, options: RedirectOptions): string {
    if (typeof value !== 'string') return FALLBACK;
    const candidate = value.trim();
    if (candidate.length === 0) return FALLBACK;

    // A same-origin path. "//host" is protocol-relative and "/\host" is normalised
    // to it by browsers, so both are rejected even though they start with a slash.
    if (candidate.startsWith('/')) {
        if (candidate.startsWith('//') || candidate.startsWith('/\\')) return FALLBACK;
        return candidate;
    }

    // Anything else has to be an absolute URL on exactly the allowed origin.
    // Comparing parsed origins — rather than a string prefix — is what makes
    // "http://localhost:4000.evil.example" and "http://localhost:4000@evil.example"
    // fail: their origins are not the allowed one.
    const allowed = options.adminOrigin?.trim();
    if (!allowed) return FALLBACK;
    try {
        const target = new URL(candidate);
        const origin = new URL(allowed);
        if (target.origin !== origin.origin) return FALLBACK;
        // Only http(s): a `javascript:` or `data:` URL has an opaque origin and
        // would not match anyway, but being explicit costs nothing.
        if (target.protocol !== 'http:' && target.protocol !== 'https:') return FALLBACK;
        return candidate;
    } catch {
        return FALLBACK;
    }
}
//
