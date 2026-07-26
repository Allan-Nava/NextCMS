/*
 * File: refresh.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { userRepo } from '../../../lib/helpers/user-repo';
import { setAccessCookie, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { isNonEmptyString } from '../../../lib/utils/validation';
//
// POST /api/auth/refresh — exchange a refresh token for a fresh access token
// (NC-39). Access tokens last 15 minutes; without this endpoint a session ends
// there and the user has to log in again.
//
// The user is re-read from the database so a deleted or demoted account cannot
// keep renewing its access for the whole refresh window.
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    const { refresh_token: refreshToken } = (req.body ?? {}) as { refresh_token?: unknown };
    if (!isNonEmptyString(refreshToken)) {
        return badRequest(res, 'refresh_token is required');
    }
    // Returns null for an access token presented here, so the two kinds cannot
    // be swapped.
    const claims = verifyRefreshToken(refreshToken);
    if (!claims) {
        res.status(401).json(errorResponse({ error: 'invalid or expired refresh token' }));
        return;
    }
    try {
        const user = await userRepo.getById(claims.sub);
        if (!user) {
            res.status(401).json(errorResponse({ error: 'invalid or expired refresh token' }));
            return;
        }
        const accessToken = signAccessToken(user);
        setAccessCookie(res, accessToken);
        res.status(200).json(
            successResponse(
                { access_token: accessToken, refresh_token: signRefreshToken(user), user },
                'token refreshed'
            )
        );
    } catch (error) {
        serverError(res, 'refresh token', error);
    }
}
//
