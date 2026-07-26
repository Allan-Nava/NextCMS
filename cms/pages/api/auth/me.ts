/*
 * File: me.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { userRepo } from '../../../lib/helpers/user-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { methodNotAllowed, notFound, serverError } from '../../../lib/utils/http';
//
// GET /api/auth/me — the current session's user (NC-39, NC-40).
//
// Reads from the database rather than trusting the token claims: a token issued
// before a role change would otherwise report stale privileges for its whole
// lifetime.
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        return methodNotAllowed(req, res, ['GET']);
    }
    const claims = requireAuth(req, res);
    if (!claims) return;
    try {
        const user = await userRepo.getById(claims.sub);
        if (!user) return notFound(res, 'user not found');
        res.status(200).json(successResponse(user, 'current user retrieved'));
    } catch (error) {
        serverError(res, 'current user', error);
    }
}
//
