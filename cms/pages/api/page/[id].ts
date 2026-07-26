/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:27:31 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { pagesRepo } from '../../../lib/helpers/page-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../lib/utils/http';
//
// GET    /api/page/:id   read           (public)
// PATCH  /api/page/:id   update         (authenticated)
// DELETE /api/page/:id   soft delete    (authenticated)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) {
        return badRequest(res, 'id must be a positive integer');
    }
    switch (req.method) {
        case 'GET':
            return getPage(res, id);
        case 'PATCH':
            return updatePage(req, res, id);
        case 'DELETE':
            return deletePage(req, res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PATCH', 'DELETE']);
    }
}
//
async function getPage(res: NextApiResponse, id: number): Promise<void> {
    try {
        const page = await pagesRepo.getById(id);
        if (!page || page.deletedAt !== null) return notFound(res, 'page not found');
        res.status(200).json(successResponse(page, 'page retrieved'));
    } catch (error) {
        serverError(res, 'get page', error);
    }
}
//
async function updatePage(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    const payload = (req.body ?? {}) as Record<string, unknown>;
    if (Object.keys(payload).length === 0) {
        return badRequest(res, 'no fields to update');
    }
    try {
        const page = await pagesRepo.update(id, payload);
        res.status(200).json(successResponse(page, 'page updated'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return notFound(res, 'page not found');
            if (error.code === 'P2002') {
                res.status(409).json(errorResponse({ error: 'a page with this slug already exists' }));
                return;
            }
        }
        serverError(res, 'update page', error);
    }
}
//
// The previous handler was an empty stub that never answered (NC-14).
async function deletePage(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    try {
        await pagesRepo.delete(id);
        res.status(200).json(successResponse({ id }, 'page deleted'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'page not found');
        }
        serverError(res, 'delete page', error);
    }
}
//
