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
import { categoryRepo } from '../../../lib/helpers/taxonomy-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
import { validateTaxonomyPayload } from '../../../lib/utils/validation';
//
// GET    /api/category/:id   read         (public)
// PATCH  /api/category/:id   update       (authenticated)
// DELETE /api/category/:id   soft delete  (authenticated)
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
        const category = await categoryRepo.getById(id);
        if (!category || category.deletedAt !== null) return notFound(res, 'category not found');
        res.status(200).json(successResponse(category, 'category retrieved'));
    } catch (error) {
        serverError(res, 'get category', error);
    }
}
//
async function update(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validateTaxonomyPayload(req.body);
    if (errors.length > 0) return badRequest(res, errors.join('; '));
    try {
        const category = await categoryRepo.update(id, { name: req.body.name, slug: req.body.slug });
        res.status(200).json(successResponse(category, 'category updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'category not found');
        }
        serverError(res, 'update category', error);
    }
}
//
async function remove(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    try {
        await categoryRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'category deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'category not found');
        }
        serverError(res, 'delete category', error);
    }
}
//
