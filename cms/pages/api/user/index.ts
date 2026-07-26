/*
 * File: index.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 7:48:35 pm
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
import { requireAdmin } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validateUserPayload } from '../../../lib/utils/validation';
//
// GET  /api/user   list users     (admin only)
// POST /api/user   create a user  (admin only)
//
// Both were public before (NC-6) and the list returned the bcrypt hash of every
// account (NC-1).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return listUsers(req, res);
        case 'POST':
            return createUser(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function listUsers(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAdmin(req, res)) return;
    try {
        res.status(200).json(successResponse(await userRepo.getAll(), 'users retrieved'));
    } catch (error) {
        serverError(res, 'list users', error);
    }
}
//
async function createUser(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAdmin(req, res)) return;
    const errors = validateUserPayload(req.body, { requirePassword: true });
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    const { username, email, password, firstName, lastName, isAdmin, isStaff } = req.body;
    try {
        // Unlike registration, an admin may grant privileges here.
        const user = await userRepo.create({
            username,
            email,
            password,
            firstName,
            lastName,
            isAdmin: isAdmin === true,
            isStaff: isStaff === true,
        });
        res.status(201).json(successResponse(user, 'user created'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json(errorResponse({ error: 'username or email already registered' }));
            return;
        }
        serverError(res, 'create user', error);
    }
}
//
