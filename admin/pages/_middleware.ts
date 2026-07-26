/*
 * File: _middleware.ts
 * Project: next-admin
 * File Created: Sunday, 27th March 2022 10:56:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, loginRedirect } from '../lib/utils/session';
//
// Sends an unauthenticated visitor to the cms login screen (NC-54).
//
// IMPORTANT: this runs on the edge runtime, where a JWT signature cannot be
// verified, so it is only a "is there a session cookie" check to avoid rendering
// an empty panel to someone logged out. The real authorisation happens in the cms
// API, which every screen here goes through — an admin-only endpoint answers 403
// to a non-admin whatever this middleware decided.
export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname, search } = req.nextUrl;
    // The proxied API must pass through untouched: its own 401 is more useful to a
    // fetch() caller than an HTML redirect.
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }
    if (req.cookies[ACCESS_TOKEN_COOKIE]) {
        return NextResponse.next();
    }
    // `basePath` is stripped from `pathname` here, so it is added back to build the
    // path the browser should return to.
    const returnTo = `/admin${pathname === '/' ? '' : pathname}${search}`;
    return NextResponse.redirect(loginRedirect({ cmsOrigin: process.env.CMS_ORIGIN ?? '', returnTo }));
}
//
