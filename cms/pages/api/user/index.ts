import { userRepo } from './../../../lib/helpers/user-repo';
/*
 * File: index.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 7:48:35 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 27th April 2022 7:58:00 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { UserCreateNextApiRequest } from '../../../lib/types/request/user-request';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log("req ", req, "res ", res);
    // 
    switch (req.method) {
        case 'GET':
            return getUsers();
        case 'POST':
            return createUser(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function getUsers() {
        const users = await userRepo.getAll();
        return res.status(200).json(users);
    }
    //
    async function createUser(req : UserCreateNextApiRequest) {
        try {
            console.log("req.body ", req.body);
            //let page = await pagesRepo.create(req.body);
            return res.status(200).json({});
        } catch (error) {
            return res.status(400).json({ message: error });
        }
    }
    //
};
//