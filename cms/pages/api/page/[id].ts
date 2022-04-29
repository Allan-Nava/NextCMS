/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:27:31 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Friday, 29th April 2022 8:11:38 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PageDetailNextApiRequest } from '../../../lib/types/request/page-request';
import { pagesRepo } from './../../../lib/helpers/page-repo';
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id;
    //
    if (req.method === 'GET') {
      //handleGET(id, res)
      getPage(req);
    } else if (req.method === 'DELETE') {
      handleDELETE(id, res)
    } else {
      throw new Error(
        `The HTTP ${req.method} method is not supported at this route.`
      )
    }
    //
    async function getPage(req : PageDetailNextApiRequest) {
      try {
          console.log("req.body ", req.body);
          // req.body.email?
          let user = await pagesRepo.getById(req.body.id);
          return res.status(200).json(user);
      } catch (error) {
          return res.status(400).json({ message: error });
      }
    }
    //
}

// GET /api/page/:id
async function handleGET(id : string|string[] , res: NextApiResponse) {
    
};
  
// DELETE /api/page/:id
async function handleDELETE(id : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*;*/
};