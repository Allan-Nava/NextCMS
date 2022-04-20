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
import prisma from '../../../lib/prisma';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // need to add the filters
    const components = await prisma.component.findMany()
    res.json(components);
};
//