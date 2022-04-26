/*
 * File: login.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:55:48 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 25th April 2022 4:55:51 pm
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
            return authLogin(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function authLogin(req: AuthLoginNextApiRequest) {
        console.log("req ", req);
        
    }
}