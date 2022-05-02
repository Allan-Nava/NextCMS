/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:28:17 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 30th April 2022 11:37:22 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { componentRepo } from './../../../lib/helpers/component-repo';
import { ComponentDetailNextApiRequest } from '../../../lib/types/request/component-request';
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id;
    //
    console.log("id ", id);
    if (req.method === 'GET') {
      //handleGET(id, res)
      getComponent(req ,res );
    } else if (req.method === 'DELETE') {
      //handleDELETE(id, res)
      deleteComponent(req ,res );
    } else {
      throw new Error(
        `The HTTP ${req.method} method is not supported at this route.`
      )
    }
    
}
//
// GET /api/components/:id
async function getComponent(req : ComponentDetailNextApiRequest, res: NextApiResponse) {
  try {
      console.log("req.body ", req.body);
      // req.body.email?
      let user = await componentRepo.getById(req.body.id);
      return res.status(200).json(user);
  } catch (error) {
      return res.status(400).json({ message: error });
  }
}
//
// DELETE /api/components/:id
async function deleteComponent(req : ComponentDetailNextApiRequest, res: NextApiResponse) {
  try {
      console.log("req.body ", req.body);
      // req.body.email?
      let user = await componentRepo.delete(req.body.id);
      return res.status(200).json(user);
  } catch (error) {
      return res.status(400).json({ message: error });
  }
}
//
// GET /api/components/:id
async function handleGET(id : string|string[] , res: NextApiResponse) {
    
};
  
// DELETE /api/components/:id
async function handleDELETE(id : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*;*/
};