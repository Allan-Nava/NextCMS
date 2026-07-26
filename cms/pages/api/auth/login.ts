/*
 * File: login.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:55:48 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { userRepo } from '../../../lib/helpers/user-repo';
import { setAccessCookie, signAccessToken, signRefreshToken } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { isNonEmptyString } from '../../../lib/utils/validation';
import { logger } from '../../../lib/utils/logger';
import { clientIp, rateLimit } from '../../../lib/utils/rate-limit';
//
// Ten attempts per IP per five minutes (NC-53). Bucketed by IP rather than by
// username so an attacker cannot lock a known account out by failing on purpose.
const LOGIN_RATE_LIMIT = { limit: 10, windowMs: 5 * 60_000 };
//
// POST /api/auth/login
//
// Response contract (NC-11): the previous version returned the raw token
// string as `data`, while the client expected `data.access_token` /
// `data.refresh_token`, so the login always failed. Both sides now agree on:
//
//   { response: "OK", message, data: { access_token, refresh_token, user } }
//
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    const limit = rateLimit(`login:${clientIp(req)}`, LOGIN_RATE_LIMIT);
    if (!limit.allowed) {
        res.setHeader('Retry-After', String(limit.retryAfterSeconds));
        res.status(429).json(errorResponse({ error: 'too many login attempts, try again later' }));
        return;
    }
    const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown };
    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
        return badRequest(res, 'username and password are required');
    }
    try {
        // Returns null on bad credentials instead of throwing, so this is a 401
        // and not an opaque 500 (NC-13).
        const user = await userRepo.verifyCredentials(username, password);
        if (!user) {
            res.status(401).json(errorResponse({ error: 'invalid username or password' }));
            return;
        }
        const accessToken = signAccessToken(user);
        setAccessCookie(res, accessToken);
        logger.info('login succeeded', { id: user.id });
        res.status(200).json(
            successResponse(
                { access_token: accessToken, refresh_token: signRefreshToken(user), user },
                'user logged in successfully'
            )
        );
    } catch (error) {
        serverError(res, 'login', error);
    }
}
//
