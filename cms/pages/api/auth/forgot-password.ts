/*
 * File: forgot-password.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { passwordResetRepo } from '../../../lib/helpers/password-reset';
import { passwordResetMessage, sendMail } from '../../../lib/helpers/mailer';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { isEmail } from '../../../lib/utils/validation';
import { clientIp, rateLimit } from '../../../lib/utils/rate-limit';
import { logger } from '../../../lib/utils/logger';
//
// POST /api/auth/forgot-password — start a password reset (NC-39).
//
// Always answers 202, whether or not the address exists: a different answer per
// case would turn this into an account-enumeration oracle.
//
// NOTE: no mail provider is configured in this project. Outside production the
// default transport logs the message instead of sending it; in production it
// logs an error and drops it. See lib/helpers/mailer.ts.
const FORGOT_RATE_LIMIT = { limit: 5, windowMs: 60 * 60_000 };
//
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    const limit = rateLimit(`forgot:${clientIp(req)}`, FORGOT_RATE_LIMIT);
    if (!limit.allowed) {
        res.setHeader('Retry-After', String(limit.retryAfterSeconds));
        res.status(429).json(errorResponse({ error: 'too many requests, try again later' }));
        return;
    }
    const { email } = (req.body ?? {}) as { email?: unknown };
    if (!isEmail(email)) {
        return badRequest(res, 'a valid email is required');
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, email: true },
        });
        if (user) {
            const { token } = await passwordResetRepo.issue(user.id);
            await sendMail(passwordResetMessage(user.email, token));
        } else {
            logger.debug('password reset requested for an unknown address');
        }
        // Same answer either way.
        res.status(202).json(successResponse({}, 'if the address exists, a reset link has been sent'));
    } catch (error) {
        serverError(res, 'forgot password', error);
    }
}
//
