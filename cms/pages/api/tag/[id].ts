/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { tagRepo } from '../../../lib/helpers/taxonomy-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
import { validateTaxonomyPayload } from '../../../lib/utils/validation';
//
// GET    /api/tag/:id   read         (public)
// PATCH  /api/tag/:id   update       (authenticated)
// DELETE /api/tag/:id   soft delete  (authenticated)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) return badRequest(res, 'id must be a positive integer');
    switch (req.method) {
        case 'GET':
            return read(res, id);
        case 'PATCH':
            return update(req, res, id);
        case 'DELETE':
            return remove(req, res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PATCH', 'DELETE']);
    }
}
//
async function read(res: NextApiResponse, id: number): Promise<void> {
    try {
        const tag = await tagRepo.getById(id);
        if (!tag || tag.deletedAt !== null) return notFound(res, 'tag not found');
        res.status(200).json(successResponse(tag, 'tag retrieved'));
    } catch (error) {
        serverError(res, 'get tag', error);
    }
}
//
async function update(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validateTaxonomyPayload(req.body);
    if (errors.length > 0) return badRequest(res, errors.join('; '));
    try {
        const tag = await tagRepo.update(id, { name: req.body.name, slug: req.body.slug });
        res.status(200).json(successResponse(tag, 'tag updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'tag not found');
        }
        serverError(res, 'update tag', error);
    }
}
//
async function remove(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    try {
        await tagRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'tag deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'tag not found');
        }
        serverError(res, 'delete tag', error);
    }
}
//
