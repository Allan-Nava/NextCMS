/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:05:33 pm
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
import { requireAdmin, requireAuth } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
import { validateUserPayload } from '../../../lib/utils/validation';
//
// GET    /api/user/:id   read    (own record, or any record for an admin)
// PATCH  /api/user/:id   update  (own record, or any record for an admin)
// DELETE /api/user/:id   delete  (admin only)
//
// The id comes from `req.query` (NC-15): the old handlers read `req.body.id` on
// GET/DELETE, where there is no body, so every lookup was `parseInt(undefined)`.
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) {
        return badRequest(res, 'id must be a positive integer');
    }
    switch (req.method) {
        case 'GET':
            return getUser(req, res, id);
        case 'PATCH':
            return updateUser(req, res, id);
        case 'DELETE':
            return deleteUser(req, res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PATCH', 'DELETE']);
    }
}
//
async function getUser(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    const claims = requireAuth(req, res);
    if (!claims) return;
    if (claims.sub !== id && !claims.isAdmin) {
        res.status(403).json(errorResponse({ error: 'you may only read your own account' }));
        return;
    }
    try {
        const user = await userRepo.getById(id);
        if (!user) return notFound(res, 'user not found');
        res.status(200).json(successResponse(user, 'user retrieved'));
    } catch (error) {
        serverError(res, 'get user', error);
    }
}
//
async function updateUser(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    const claims = requireAuth(req, res);
    if (!claims) return;
    const isSelf = claims.sub === id;
    if (!isSelf && !claims.isAdmin) {
        res.status(403).json(errorResponse({ error: 'you may only update your own account' }));
        return;
    }
    const payload = (req.body ?? {}) as Record<string, unknown>;
    // A partial update: only the fields present are validated.
    const errors = validateUserPayload({ ...payload, username: payload.username ?? claims.username }, { requirePassword: false });
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    // Privilege escalation guard: only an admin may change the role flags, so a
    // user cannot promote themselves by adding isAdmin to their own PATCH.
    if (!claims.isAdmin && (payload.isAdmin !== undefined || payload.isStaff !== undefined)) {
        res.status(403).json(errorResponse({ error: 'only an admin may change role flags' }));
        return;
    }
    try {
        const user = await userRepo.update(id, {
            email: payload.email as string | undefined,
            firstName: payload.firstName as string | undefined,
            lastName: payload.lastName as string | undefined,
            password: payload.password as string | undefined,
            isAdmin: claims.isAdmin ? (payload.isAdmin as boolean | undefined) : undefined,
            isStaff: claims.isAdmin ? (payload.isStaff as boolean | undefined) : undefined,
        });
        res.status(200).json(successResponse(user, 'user updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'user not found');
        }
        serverError(res, 'update user', error);
    }
}
//
async function deleteUser(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    const claims = requireAdmin(req, res);
    if (!claims) return;
    try {
        await userRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'user deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'user not found');
        }
        serverError(res, 'delete user', error);
    }
}
//
