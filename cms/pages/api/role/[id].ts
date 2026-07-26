/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:49:50 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { roleRepo } from '../../../lib/helpers/role-repo';
import { requireAdmin } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
import { isNonEmptyString } from '../../../lib/utils/validation';
//
// GET    /api/role/:id   read         (admin only)
// PATCH  /api/role/:id   rename       (admin only)
// DELETE /api/role/:id   soft delete  (admin only)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) {
        return badRequest(res, 'id must be a positive integer');
    }
    if (!requireAdmin(req, res)) return;
    switch (req.method) {
        case 'GET':
            return getRole(res, id);
        case 'PATCH':
            return updateRole(req, res, id);
        case 'DELETE':
            return deleteRole(res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PATCH', 'DELETE']);
    }
}
//
async function getRole(res: NextApiResponse, id: number): Promise<void> {
    try {
        const role = await roleRepo.getById(id);
        if (!role || role.deletedAt !== null) return notFound(res, 'role not found');
        res.status(200).json(successResponse(role, 'role retrieved'));
    } catch (error) {
        serverError(res, 'get role', error);
    }
}
//
async function updateRole(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    const { name } = (req.body ?? {}) as { name?: unknown };
    if (!isNonEmptyString(name)) {
        return badRequest(res, 'name is required');
    }
    try {
        res.status(200).json(successResponse(await roleRepo.update(id, name), 'role updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'role not found');
        }
        serverError(res, 'update role', error);
    }
}
//
async function deleteRole(res: NextApiResponse, id: number): Promise<void> {
    try {
        await roleRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'role deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'role not found');
        }
        serverError(res, 'delete role', error);
    }
}
//
