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
import { optionalAuth, requireAuth } from '../../../lib/helpers/auth';
import { errorResponse, pagedResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, parseId, serverError } from '../../../lib/utils/http';
import { validatePagePayload } from '../../../lib/utils/validation';
import { paginationMeta, parsePagination } from '../../../lib/utils/pagination';
//
// GET  /api/page   list pages   (public: this is published content)
// POST /api/page   create page  (authenticated)
//
// The POST used to have its create call commented out and answered `200 {}`,
// pretending to have written something (NC-17).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return listPages(req, res);
        case 'POST':
            return createPage(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
// Filters (NC-41): `?type=post`, `?category=<id>`, `?tag=<slug>`. An
// unauthenticated caller only ever sees published content — the editor is
// authenticated and gets drafts too.
async function listPages(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const tagSlug = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const categoryId = parseId(req.query.category) ?? undefined;
    if (req.query.category !== undefined && categoryId === undefined) {
        return badRequest(res, 'category must be a positive integer');
    }
    const claims = optionalAuth(req);
    // `?author=me` is the "my drafts" case (NC-79); an explicit id is also allowed.
    let authorId = parseId(req.query.author) ?? undefined;
    if (req.query.author === 'me') {
        if (!claims) return badRequest(res, 'author=me requires a session');
        authorId = claims.sub;
    } else if (req.query.author !== undefined && authorId === undefined) {
        return badRequest(res, 'author must be a positive integer or "me"');
    }
    const pagination = parsePagination(req.query);
    try {
        const { rows, total } = await pagesRepo.getAll(
            { type, tagSlug, categoryId, authorId, publishedOnly: claims === null },
            pagination
        );
        res.status(200).json(pagedResponse(rows, paginationMeta(total, pagination), 'pages retrieved'));
    } catch (error) {
        serverError(res, 'list pages', error);
    }
}
//
async function createPage(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const claims = requireAuth(req, res);
    if (!claims) return;
    const errors = validatePagePayload(req.body);
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    const { title, slug, description, type, seoTitle, seoDescription, jsonld, categoryId, tagNames, published } =
        req.body;
    try {
        const page = await pagesRepo.create({
            // Taken from the session, never from the payload: a client must not be
            // able to publish under someone else's name (NC-79).
            authorId: claims.sub,
            title,
            slug,
            description,
            type,
            seoTitle,
            seoDescription,
            jsonld,
            categoryId,
            tagNames,
            published,
        });
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
