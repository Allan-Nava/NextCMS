/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:28:17 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 5th April 2022 9:28:20 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id;
    //
    console.log("id ", id);
    if (req.method === 'GET') {
      handleGET(id, res)
    } else if (req.method === 'DELETE') {
      handleDELETE(id, res)
    } else {
      throw new Error(
        `The HTTP ${req.method} method is not supported at this route.`
      )
    }
}

// GET /api/components/:id
async function handleGET(id : string|string[] , res: NextApiResponse) {
    
};
  
// DELETE /api/components/:id
async function handleDELETE(id : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*;*/
};