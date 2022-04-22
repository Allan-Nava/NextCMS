/*
 * File: index.ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:00:36 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 9:00:38 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // need to add the filters
    try{
        const data = await prisma.user.findMany()
        res.json(data);
    } catch (error) {
        console.error("error ", error );
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
    }
};
//