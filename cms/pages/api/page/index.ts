/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 8:57:51 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 8:57:53 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { pagesRepo } from '../../../lib/helpers/page-repo';
//import prisma from '../../../lib/prisma';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log("req ", req, "res ", res);
    // need to add the filters
    switch (req.method) {
        case 'GET':
            return getPages();
        case 'POST':
            return createPages();
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function getPages() {
        const pages = await pagesRepo.getAll();
        return res.status(200).json(pages);
    }
    //
    async function createPages() {
        try {
            await pagesRepo.create(req.body);
            return res.status(200).json({});
        } catch (error) {
            return res.status(400).json({ message: error });
        }
    }
};
//