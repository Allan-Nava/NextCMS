/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 8:57:51 pm
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
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validatePagePayload } from '../../../lib/utils/validation';
//
// GET  /api/page   list pages   (public: this is published content)
// POST /api/page   create page  (authenticated)
//
// The POST used to have its create call commented out and answered `200 {}`,
// pretending to have written something (NC-17).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return listPages(res);
        case 'POST':
            return createPage(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function listPages(res: NextApiResponse): Promise<void> {
    try {
        res.status(200).json(successResponse(await pagesRepo.getAll(), 'pages retrieved'));
    } catch (error) {
        serverError(res, 'list pages', error);
    }
}
//
async function createPage(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validatePagePayload(req.body);
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    const { title, slug, description, type, seoTitle, seoDescription, tags, jsonld } = req.body;
    try {
        const page = await pagesRepo.create({ title, slug, description, type, seoTitle, seoDescription, tags, jsonld });
        res.status(201).json(successResponse(page, 'page created'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json(errorResponse({ error: 'a page with this slug already exists' }));
            return;
        }
        serverError(res, 'create page', error);
    }
}
//
