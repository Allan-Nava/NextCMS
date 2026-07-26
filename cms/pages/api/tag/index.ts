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
import { tagRepo } from '../../../lib/helpers/taxonomy-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { errorResponse, pagedResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validateTaxonomyPayload } from '../../../lib/utils/validation';
import { paginationMeta, parsePagination } from '../../../lib/utils/pagination';
//
// GET  /api/tag   list    (public: taxonomies are part of the content)
// POST /api/tag   create  (authenticated)
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return list(req, res);
        case 'POST':
            return create(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function list(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
        const pagination = parsePagination(req.query);
        const { rows, total } = await tagRepo.getAll(pagination);
        res.status(200).json(pagedResponse(rows, paginationMeta(total, pagination), 'tags retrieved'));
    } catch (error) {
        serverError(res, 'list tags', error);
    }
}
//
async function create(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validateTaxonomyPayload(req.body);
    if (errors.length > 0) return badRequest(res, errors.join('; '));
    try {
        const tag = await tagRepo.create({ name: req.body.name, slug: req.body.slug });
        res.status(201).json(successResponse(tag, 'tag created'));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json(errorResponse({ error: 'a tag with this slug already exists' }));
            return;
        }
        serverError(res, 'create tag', error);
    }
}
//
