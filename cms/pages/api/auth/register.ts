/*
 * File: register.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 8:06:38 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 25th April 2022 8:06:40 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { userRepo } from './../../../lib/helpers/user-repo';
import { AuthRegisterNextApiRequest } from '../../../lib/types/request/auth-request';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log("req ", req, "res ", res);
    switch (req.method) {
        case 'POST':
            return authRegister(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function authRegister(req: AuthRegisterNextApiRequest) {
        console.log("req ", req);
        req.body.username = req.body.username.toLowerCase();
        const user = await userRepo.create(req.body.username, req.body.username, req.body.password, req.body.firstName, req.body.lastName, false, false);
        const userObject = JSON.parse(JSON.stringify(user));
        return res.status(201).json(userObject);
    }
};
//