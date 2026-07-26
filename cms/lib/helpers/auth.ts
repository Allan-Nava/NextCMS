/*
 * File: auth.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Token issuing/verification and the route guards (NC-2, NC-3, NC-6).
//
// This lives in the Node runtime on purpose: `_middleware.ts` runs on the edge
// runtime, where `jsonwebtoken` cannot verify a signature. The middleware only
// does a cheap cookie presence check for page redirects — the real
// authorisation decision is taken here, inside the API handlers.
//
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PublicUser, TokenClaims } from '../types/user';
import { errorResponse } from '../types/response/response';
import { envOrDefault, isProduction, requireEnv } from '../utils/env';
import { logger } from '../utils/logger';
//
export const ACCESS_TOKEN_COOKIE = 'access_token';
//
// Read lazily: `next build` must not require production secrets to be present.
const secret = (): string => requireEnv('JWT_SECRET');
const accessTtl = (): string => envOrDefault('JWT_ACCESS_TTL', '15m');
const refreshTtl = (): string => envOrDefault('JWT_REFRESH_TTL', '7d');
//
export function claimsFor(user: PublicUser): TokenClaims {
    return { sub: user.id, username: user.username, isAdmin: user.isAdmin, isStaff: user.isStaff };
}
//
export function signAccessToken(user: PublicUser): string {
    return jwt.sign(claimsFor(user), secret(), { expiresIn: accessTtl() } as jwt.SignOptions);
}
//
// The refresh token carries `type: 'refresh'` so it cannot be replayed as an
// access token by `verifyAccessToken`.
export function signRefreshToken(user: PublicUser): string {
    return jwt.sign({ ...claimsFor(user), type: 'refresh' }, secret(), { expiresIn: refreshTtl() } as jwt.SignOptions);
}
//
export function verifyAccessToken(token: string): TokenClaims | null {
    try {
        const decoded = jwt.verify(token, secret()) as unknown as TokenClaims & { type?: string };
        if (decoded.type === 'refresh') return null;
        return { sub: decoded.sub, username: decoded.username, isAdmin: decoded.isAdmin, isStaff: decoded.isStaff };
    } catch (error) {
        logger.debug('token verification failed', { reason: (error as Error).name });
        return null;
    }
}
//
export function verifyRefreshToken(token: string): TokenClaims | null {
    try {
        const decoded = jwt.verify(token, secret()) as unknown as TokenClaims & { type?: string };
        if (decoded.type !== 'refresh') return null;
        return { sub: decoded.sub, username: decoded.username, isAdmin: decoded.isAdmin, isStaff: decoded.isStaff };
    } catch (error) {
        logger.debug('refresh token verification failed', { reason: (error as Error).name });
        return null;
    }
}
//
// Accepts `Authorization: Bearer <token>` or the access-token cookie.
export function extractToken(req: NextApiRequest): string | null {
    const header = req.headers.authorization;
    if (header && header.toLowerCase().startsWith('bearer ')) {
        return header.slice(7).trim() || null;
    }
    const cookie = req.cookies?.[ACCESS_TOKEN_COOKIE];
    return cookie && cookie.length > 0 ? cookie : null;
}
//
// The access token is also stored in an HttpOnly cookie so server-rendered
// pages and the edge middleware can see that a session exists. HttpOnly means
// client JavaScript cannot read it, which is the point.
export function setAccessCookie(res: NextApiResponse, token: string): void {
    const attributes = [
        `${ACCESS_TOKEN_COOKIE}=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
    ];
    if (isProduction()) attributes.push('Secure');
    res.setHeader('Set-Cookie', attributes.join('; '));
}
//
export function clearAccessCookie(res: NextApiResponse): void {
    const attributes = [
        `${ACCESS_TOKEN_COOKIE}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
    ];
    if (isProduction()) attributes.push('Secure');
    res.setHeader('Set-Cookie', attributes.join('; '));
}
//
// Guards: they answer the request themselves and return null when the caller
// must stop. Usage:
//
//     const claims = requireAuth(req, res);
//     if (!claims) return;
//
export function requireAuth(req: NextApiRequest, res: NextApiResponse): TokenClaims | null {
    const token = extractToken(req);
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
        res.status(401).json(errorResponse({ error: 'authentication required' }));
        return null;
    }
    return claims;
}
//
export function requireAdmin(req: NextApiRequest, res: NextApiResponse): TokenClaims | null {
    const claims = requireAuth(req, res);
    if (!claims) return null;
    if (!claims.isAdmin) {
        logger.warn('admin-only route refused', { user: claims.sub });
        res.status(403).json(errorResponse({ error: 'admin privileges required' }));
        return null;
    }
    return claims;
}
//
