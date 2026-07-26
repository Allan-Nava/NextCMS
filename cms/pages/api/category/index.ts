/*
 * File: index.ts
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
import { errorResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validateTaxonomyPayload } from '../../../lib/utils/validation';
//
// GET  /api/category   list    (public: taxonomies are part of the content)
// POST /api/category   create  (authenticated)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return list(res);
        case 'POST':
            return create(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function list(res: NextApiResponse): Promise<void> {
    try {
        res.status(200).json(successResponse(await categoryRepo.getAll(), 'categories retrieved'));
    } catch (error) {
        serverError(res, 'list categories', error);
    }
}
//
async function create(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validateTaxonomyPayload(req.body);
    if (errors.length > 0) return badRequest(res, errors.join('; '));
    try {
        const category = await categoryRepo.create({ name: req.body.name, slug: req.body.slug });
        res.status(201).json(successResponse(category, 'category created'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json(errorResponse({ error: 'a category with this slug already exists' }));
            return;
        }
        serverError(res, 'create category', error);
    }
}
//
