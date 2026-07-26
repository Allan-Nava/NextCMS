/*
 * File: logout.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:58:21 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAccessCookie } from '../../../lib/helpers/auth';
import { successResponse } from '../../../lib/types/response/response';
import { methodNotAllowed } from '../../../lib/utils/http';
//
// POST /api/auth/logout
//
// The previous handler had an empty body and never answered, so the request
// hung until the client gave up (NC-14). Logout is stateless — tokens are not
// tracked server-side — so all it does is clear the cookie; a client holding a
// bearer token must drop it.
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return methodNotAllowed(req, res, ['POST']);
    }
    clearAccessCookie(res);
    res.status(200).json(successResponse({}, 'user logged out successfully'));
}
//
