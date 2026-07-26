/*
 * File: reset-password.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { userRepo } from '../../../lib/helpers/user-repo';
import { passwordResetRepo } from '../../../lib/helpers/password-reset';
import { clearAccessCookie } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { MIN_PASSWORD_LENGTH, isNonEmptyString } from '../../../lib/utils/validation';
import { clientIp, rateLimit } from '../../../lib/utils/rate-limit';
import { logger } from '../../../lib/utils/logger';
//
// POST /api/auth/reset-password — redeem a reset token (NC-39).
//
// The token is single-use: `consume` marks it used in the same statement that
// claims it, so two concurrent requests cannot both succeed.
const RESET_RATE_LIMIT = { limit: 10, windowMs: 60 * 60_000 };
//
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    const limit = rateLimit(`reset:${clientIp(req)}`, RESET_RATE_LIMIT);
    if (!limit.allowed) {
        res.setHeader('Retry-After', String(limit.retryAfterSeconds));
        res.status(429).json(errorResponse({ error: 'too many requests, try again later' }));
        return;
    }
    const { token, password } = (req.body ?? {}) as { token?: unknown; password?: unknown };
    if (!isNonEmptyString(token)) {
        return badRequest(res, 'token is required');
    }
    if (!isNonEmptyString(password) || password.length < MIN_PASSWORD_LENGTH) {
        return badRequest(res, `password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    try {
        const userId = await passwordResetRepo.consume(token);
        if (userId === null) {
            res.status(400).json(errorResponse({ error: 'invalid or expired token' }));
            return;
        }
        await userRepo.update(userId, { password });
        // Existing access tokens stay valid until they expire — they are
        // stateless. Clearing the cookie at least signs out this browser.
        clearAccessCookie(res);
        logger.info('password reset completed', { userId });
        res.status(200).json(successResponse({}, 'password updated, please sign in again'));
    } catch (error) {
        serverError(res, 'reset password', error);
    }
}
//
