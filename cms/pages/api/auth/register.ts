/*
 * File: register.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 8:06:38 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { userRepo } from '../../../lib/helpers/user-repo';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validateUserPayload } from '../../../lib/utils/validation';
import { envFlag } from '../../../lib/utils/env';
//
// POST /api/auth/register
//
// Self-registration is off by default (NC-8): a CMS is not usually a site where
// anyone can create an account. Set ALLOW_PUBLIC_REGISTRATION=true to open it;
// with it off, accounts are created by an admin through POST /api/user.
//
// The response carries the public projection, never the whole row — the old
// version answered 201 with the bcrypt hash included (NC-1).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    if (!envFlag('ALLOW_PUBLIC_REGISTRATION', false)) {
        res.status(403).json(errorResponse({ error: 'public registration is disabled' }));
        return;
    }
    const errors = validateUserPayload(req.body, { requirePassword: true });
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    const { username, email, password, firstName, lastName } = req.body;
    try {
        // isAdmin/isStaff are never taken from the payload here: a public
        // endpoint must not be able to mint an administrator.
        const user = await userRepo.create({ username, email, password, firstName, lastName });
        res.status(201).json(successResponse(user, 'user registered successfully'));
    } catch (error) {
        // P2002 = unique constraint: username or email already taken. Reported
        // as a 409 rather than a 500 (NC-20: the old code also copied username
        // into email, so the second registration always collided).
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json(errorResponse({ error: 'username or email already registered' }));
            return;
        }
        serverError(res, 'register', error);
    }
}
//
