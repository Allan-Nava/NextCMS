/*
 * File: _middleware.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:56:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
//
// Page-level gate for the authoring screens (NC-6).
//
// IMPORTANT: this runs on the edge runtime, where `jsonwebtoken` cannot verify
// a signature — so this is only a cheap "is there a session cookie" check that
// avoids showing a logged-out user the builder. It is NOT an authorisation
// decision: every API route enforces the real check with `requireAuth` /
// `requireAdmin` from lib/helpers/auth.ts. Do not move authorisation here.
//
const PROTECTED_PREFIXES = ['/page-builder'];
//
export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!isProtected) {
        return NextResponse.next();
    }
    if (req.cookies['access_token']) {
        return NextResponse.next();
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
}
//
