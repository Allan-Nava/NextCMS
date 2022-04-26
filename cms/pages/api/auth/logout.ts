/*
 * File: logout.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:58:21 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 25th April 2022 4:58:23 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { pagesRepo } from '../../../lib/helpers/page-repo';
import { AuthLoginNextApiRequest } from '../../../lib/types/request/auth-request';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log("req ", req, "res ", res);
    switch (req.method) {
        case 'POST':
            return authLogout(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    // need to change with the correct request
    async function authLogout(req: AuthLoginNextApiRequest) {
        console.log("req ", req);
        
    }
}