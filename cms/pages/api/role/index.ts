/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:04:29 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { roleRepo } from '../../../lib/helpers/role-repo';
import { requireAdmin } from '../../../lib/helpers/auth';
import { pagedResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { isNonEmptyString } from '../../../lib/utils/validation';
import { paginationMeta, parsePagination } from '../../../lib/utils/pagination';
//
// GET  /api/role   list roles   (admin only)
// POST /api/role   create role  (admin only)
//
// This was the one route that reached for `prisma` directly, bypassing the repo
// layer, and whose catch branch never answered the request (NC-14, NC-23).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return listRoles(req, res);
        case 'POST':
            return createRole(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function listRoles(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAdmin(req, res)) return;
    try {
        const pagination = parsePagination(req.query);
        const { rows, total } = await roleRepo.getAll(pagination);
        res.status(200).json(pagedResponse(rows, paginationMeta(total, pagination), 'roles retrieved'));
    } catch (error) {
        serverError(res, 'list roles', error);
    }
}
//
async function createRole(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAdmin(req, res)) return;
    const { name } = (req.body ?? {}) as { name?: unknown };
    if (!isNonEmptyString(name)) {
        return badRequest(res, 'name is required');
    }
    try {
        res.status(201).json(successResponse(await roleRepo.create(name), 'role created'));
    } catch (error) {
        serverError(res, 'create role', error);
    }
}
//
