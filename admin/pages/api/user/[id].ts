/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:05:33 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 9:06:02 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.query.id;
    //
    if (req.method === 'GET') {
      handleGET(userId, res)
    } else if (req.method === 'DELETE') {
      handleDELETE(userId, res)
    } else {
      throw new Error(
        `The HTTP ${req.method} method is not supported at this route.`
      )
    }
}

// GET /api/user/:id
async function handleGET(userId : string|string[] , res: NextApiResponse) {
    const data = await prisma.user.findUnique({
      where: { id: Number(userId) }
    })
    res.json(data);
}
  
// DELETE /api/user/:id
async function handleDELETE(userId : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*const data = await prisma.user.delete({
        where: { id: Number(userId) },
    })
    res.json(data);*/
}