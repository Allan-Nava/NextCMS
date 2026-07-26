/*
 * File: layout.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { pagesRepo } from '../../../../lib/helpers/page-repo';
import { componentRepo } from '../../../../lib/helpers/component-repo';
import { requireAuth } from '../../../../lib/helpers/auth';
import { successResponse } from '../../../../lib/types/response/response';
import { badRequest, methodNotAllowed, notFound, parseId, serverError } from '../../../../lib/utils/http';
import { validateLayoutPayload } from '../../../../lib/utils/validation';
//
// GET /api/page/:id/layout   the page's blocks in order   (public)
// PUT /api/page/:id/layout   replace the layout           (authenticated)
//
// This is what makes the page builder more than a toy (NC-42): the drag-and-drop
// UI held its layout in Redux and nothing ever wrote it down.
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseId(req.query.id);
    if (id === null) {
        return badRequest(res, 'id must be a positive integer');
    }
    switch (req.method) {
        case 'GET':
            return getLayout(res, id);
        case 'PUT':
            return putLayout(req, res, id);
        default:
            return methodNotAllowed(req, res, ['GET', 'PUT']);
    }
}
//
async function getLayout(res: NextApiResponse, id: number): Promise<void> {
    try {
        const blocks = await componentRepo.getForPage(id);
        res.status(200).json(successResponse(blocks.map(componentRepo.toPageComponent), 'layout retrieved'));
    } catch (error) {
        serverError(res, 'get layout', error);
    }
}
//
async function putLayout(req: NextApiRequest, res: NextApiResponse, id: number): Promise<void> {
    if (!requireAuth(req, res)) return;
    // Validation rejects unregistered component paths too, so a layout can never
    // be saved that the renderer would not be able to draw (NC-34).
    const errors = validateLayoutPayload(req.body);
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    try {
        // The page must exist: otherwise the blocks would be orphans attached to
        // an id nothing renders.
        const page = await pagesRepo.getById(id);
        if (!page || page.deletedAt !== null) return notFound(res, 'page not found');
        const blocks = await componentRepo.replaceForPage(id, req.body.components);
        res.status(200).json(successResponse(blocks.map(componentRepo.toPageComponent), 'layout saved'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return notFound(res, 'page not found');
        }
        serverError(res, 'save layout', error);
    }
}
//
