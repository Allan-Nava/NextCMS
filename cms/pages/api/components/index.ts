/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 8:54:51 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 8:54:53 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { componentRepo } from './../../../lib/helpers/component-repo';
import { ComponentNextApiRequest } from '../../../lib/types/request/component-request';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // 
    switch (req.method) {
        case 'GET':
            return getComponents();
        case 'POST':
            return createComponent(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function getComponents() {
        const pages = await componentRepo.getAll();
        return res.status(200).json(pages);
    }
    //
    async function createComponent(req : ComponentNextApiRequest) {
        try {
            console.log("req.body ", req.body);
            //let page = await componentRepo.create(req.body);
            return res.status(200).json({});
        } catch (error) {
            return res.status(400).json({ message: error });
        }
    }
};
//