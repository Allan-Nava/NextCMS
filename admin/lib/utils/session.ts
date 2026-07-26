/*
 * File: session.ts
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Session plumbing for the admin panel (NC-54).
//
// The panel has no login of its own and no token of its own. Two facts make that
// work:
//
//   1. Cookies are scoped by host, not by port (RFC 6265), so the HttpOnly
//      `access_token` set by the cms on localhost:3000 is also sent to
//      localhost:4000 in development. In production the intended topology is one
//      origin with the panel under /admin, where it is the same host anyway.
//   2. The browser only ever calls the admin origin: `apiPath` returns a
//      same-origin path that `next.config.js` proxies to the cms API. So there is
//      no CORS to configure and no token in localStorage to steal.
//
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const ADMIN_ROOT = '/admin';
//
export interface LoginRedirectOptions {
    cmsOrigin: string;
    returnTo: string;
}
//
// `returnTo` reaches us through the URL, so it is attacker-controlled: anything
// that could leave this site is replaced by the admin root. Rejecting a leading
// "//" and a backslash matters as much as rejecting a scheme — browsers treat
// "//evil.example" as protocol-relative and normalise "/\" to "//".
export function safeReturnTo(value: string | undefined): string {
    if (typeof value !== 'string') return ADMIN_ROOT;
    const candidate = value.trim();
    if (candidate.length === 0) return ADMIN_ROOT;
    if (!candidate.startsWith('/')) return ADMIN_ROOT;
    if (candidate.startsWith('//') || candidate.startsWith('/\\')) return ADMIN_ROOT;
    return candidate;
}
//
export function loginRedirect({ cmsOrigin, returnTo }: LoginRedirectOptions): string {
    const base = cmsOrigin.replace(/\/+$/, '');
    const next = encodeURIComponent(safeReturnTo(returnTo));
    // With no origin configured, a relative path at least fails visibly on this
    // site instead of pointing at a URL built from an empty string.
    return `${base}/login?next=${next}`;
}
//
export type QueryValue = string | number | boolean | undefined | null;
//
// Same-origin path to the proxied cms API. `basePath: '/admin'` in next.config.js
// means a fetch to `/admin/api/...` from a page in this app is same-origin.
export function apiPath(resource: string, query: Record<string, QueryValue> = {}): string {
    const path = resource.replace(/^\/+/, '');
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        const asString = String(value);
        if (asString.length === 0) continue;
        params.append(key, asString);
    }
    const search = params.toString();
    return `${ADMIN_ROOT}/api/${path}${search.length > 0 ? `?${search}` : ''}`;
}
//
