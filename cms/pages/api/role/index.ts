/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:04:29 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 9:04:31 pm
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
    try{ 
        const data = await prisma.role.findMany()
        res.json(data);
    } catch (error) {
        console.error("error ", error );
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
    }
};
//