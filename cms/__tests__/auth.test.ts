/*
 * File: auth.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Covers the security properties the M1 work is supposed to guarantee (NC-2,
// NC-3, NC-6). These are the claims worth a regression test: a token must not
// carry the password hash, a refresh token must not be usable as an access
// token, and a missing secret must fail loudly.
//
import type { NextApiRequest, NextApiResponse } from 'next';
import {
    extractToken,
    requireAdmin,
    requireAuth,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from '../lib/helpers/auth';
import type { PublicUser } from '../lib/types/user';
//
const user: PublicUser = {
    id: 7,
    username: 'editor',
    email: 'editor@example.com',
    firstName: 'Ed',
    lastName: 'Itor',
    isAdmin: false,
    isStaff: true,
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};
//
const admin: PublicUser = { ...user, id: 1, username: 'root', isAdmin: true };
//
function mockRes(): NextApiResponse & { statusCode: number; body: unknown } {
    const res = {
        statusCode: 0,
        body: undefined as unknown,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
        json(payload: unknown) {
            res.body = payload;
            return res;
        },
        setHeader() {
            return res;
        },
    };
    return res as unknown as NextApiResponse & { statusCode: number; body: unknown };
}
//
function mockReq(headers: Record<string, string> = {}, cookies: Record<string, string> = {}): NextApiRequest {
    return { headers, cookies } as unknown as NextApiRequest;
}
//
beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-not-used-anywhere-real';
});
//
describe('token claims', () => {
    it('carries only the minimal claims, never the password hash', () => {
        const claims = verifyAccessToken(signAccessToken(user));
        expect(claims).toEqual({ sub: 7, username: 'editor', isAdmin: false, isStaff: true });
        expect(JSON.stringify(claims)).not.toContain('password');
    });

    it('rejects a token signed with a different secret', () => {
        const token = signAccessToken(user);
        process.env.JWT_SECRET = 'a-completely-different-secret';
        expect(verifyAccessToken(token)).toBeNull();
    });

    it('rejects a tampered token', () => {
        const [header, payload, signature] = signAccessToken(user).split('.');
        const forged = Buffer.from(JSON.stringify({ sub: 1, username: 'root', isAdmin: true, isStaff: true })).toString(
            'base64url'
        );
        expect(verifyAccessToken(`${header}.${forged}.${signature}`)).toBeNull();
        expect(payload).not.toEqual(forged);
    });

    it('refuses a missing secret instead of falling back to a default', () => {
        delete process.env.JWT_SECRET;
        expect(() => signAccessToken(user)).toThrow(/JWT_SECRET/);
    });
});
//
describe('access and refresh tokens are not interchangeable', () => {
    it('does not accept a refresh token as an access token', () => {
        expect(verifyAccessToken(signRefreshToken(user))).toBeNull();
    });

    it('does not accept an access token as a refresh token', () => {
        expect(verifyRefreshToken(signAccessToken(user))).toBeNull();
    });
});
//
describe('extractToken', () => {
    it('reads the Authorization header', () => {
        expect(extractToken(mockReq({ authorization: 'Bearer abc' }))).toBe('abc');
    });

    it('falls back to the cookie', () => {
        expect(extractToken(mockReq({}, { access_token: 'from-cookie' }))).toBe('from-cookie');
    });

    it('returns null when there is nothing to read', () => {
        expect(extractToken(mockReq())).toBeNull();
    });
});
//
describe('guards', () => {
    it('requireAuth answers 401 when no token is present', () => {
        const res = mockRes();
        expect(requireAuth(mockReq(), res)).toBeNull();
        expect(res.statusCode).toBe(401);
    });

    it('requireAuth passes a valid token through', () => {
        const res = mockRes();
        const req = mockReq({ authorization: `Bearer ${signAccessToken(user)}` });
        expect(requireAuth(req, res)?.sub).toBe(7);
        expect(res.statusCode).toBe(0);
    });

    it('requireAdmin answers 403 for a non-admin', () => {
        const res = mockRes();
        const req = mockReq({ authorization: `Bearer ${signAccessToken(user)}` });
        expect(requireAdmin(req, res)).toBeNull();
        expect(res.statusCode).toBe(403);
    });

    it('requireAdmin lets an admin through', () => {
        const res = mockRes();
        const req = mockReq({ authorization: `Bearer ${signAccessToken(admin)}` });
        expect(requireAdmin(req, res)?.isAdmin).toBe(true);
    });
});
//
