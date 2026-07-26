/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:28:17 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { componentRepo } from '../../../lib/helpers/component-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
import { isRegisteredComponent, registeredComponentPaths } from '../../../components/registry';
//
// GET    /api/components/:id   read         (public)
// PATCH  /api/components/:id   update       (authenticated)
// DELETE /api/components/:id   soft delete  (authenticated)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) {
        return badRequest(res, 'id must be a positive integer');
    }
    switch (req.method) {
        case 'GET':
            return getComponent(res, id);
        case 'PATCH':
            return updateComponent(req, res, id);
        case 'DELETE':
            return deleteComponent(req, res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PATCH', 'DELETE']);
    }
}
//
async function getComponent(res: NextApiResponse, id: number): Promise<void> {
    try {
        const component = await componentRepo.getById(id);
        if (!component || component.deletedAt !== null) return notFound(res, 'component not found');
        res.status(200).json(successResponse(component, 'component retrieved'));
    } catch (error) {
        serverError(res, 'get component', error);
    }
}
//
async function updateComponent(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    const payload = (req.body ?? {}) as Record<string, unknown>;
    if (Object.keys(payload).length === 0) {
        return badRequest(res, 'no fields to update');
    }
    if (payload.path !== undefined && !isRegisteredComponent(payload.path)) {
        return badRequest(res, `unknown component path; available: ${registeredComponentPaths().join(', ')}`);
    }
    try {
        const component = await componentRepo.update(id, payload);
        res.status(200).json(successResponse(component, 'component updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'component not found');
        }
        serverError(res, 'update component', error);
    }
}
//
async function deleteComponent(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    try {
        await componentRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'component deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'component not found');
        }
        serverError(res, 'delete component', error);
    }
}
//
