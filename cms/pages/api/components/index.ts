/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 8:54:51 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { componentRepo } from '../../../lib/helpers/component-repo';
import { requireAuth } from '../../../lib/helpers/auth';
import { pagedResponse, successResponse } from '../../../lib/types/response/response';
import { badRequest, methodNotAllowed, serverError } from '../../../lib/utils/http';
import { validateComponentPayload } from '../../../lib/utils/validation';
import { paginationMeta, parsePagination } from '../../../lib/utils/pagination';
import { isRegisteredComponent, registeredComponentPaths } from '../../../components/registry';
//
// GET  /api/components   list components   (public: needed to render pages)
// POST /api/components   create component  (authenticated)
//
// The POST used to answer `200 {}` with the create call commented out (NC-17).
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            return listComponents(req, res);
        case 'POST':
            return createComponent(req, res);
        default:
            return methodNotAllowed(req, res, ['GET', 'POST']);
    }
}
//
async function listComponents(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
        const pagination = parsePagination(req.query);
        const { rows, total } = await componentRepo.getAll(pagination);
        res.status(200).json(pagedResponse(rows, paginationMeta(total, pagination), 'components retrieved'));
    } catch (error) {
        serverError(res, 'list components', error);
    }
}
//
async function createComponent(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (!requireAuth(req, res)) return;
    const errors = validateComponentPayload(req.body);
    if (errors.length > 0) {
        return badRequest(res, errors.join('; '));
    }
    const { name, path, parent, props, supportNestedComponent } = req.body;
    // The renderer only loads components from a static allow-list (NC-34), so
    // refuse an unknown path here instead of storing a row that can never render.
    if (!isRegisteredComponent(path)) {
        return badRequest(res, `unknown component path; available: ${registeredComponentPaths().join(', ')}`);
    }
    try {
        const component = await componentRepo.create({ name, path, parent, props, supportNestedComponent });
        res.status(201).json(successResponse(component, 'component created'));
    } catch (error) {
        serverError(res, 'create component', error);
    }
}
//
