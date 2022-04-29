/*
 * File: [id].ts
 * Project: next-cms
 * File Created: Tuesday, 5th April 2022 9:49:50 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Friday, 29th April 2022 8:09:00 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import { roleRepo } from './../../../lib/helpers/role-repo';
import type { NextApiRequest, NextApiResponse } from 'next';
import { RoleDetailNextApiRequest } from '../../../lib/types/request/role-request';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id;
  //
  if (req.method === 'GET') {
    getRole(req);
  } else if (req.method === 'DELETE') {
    handleDELETE(id, res)
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
  
  //
  async function getRole(req : RoleDetailNextApiRequest) {
    try {
        console.log("req.body ", req.body);
        // req.body.email?
        let user = await roleRepo.getById(req.body.id);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
  }
  //
}


// DELETE /api/role/:id
async function handleDELETE(id : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*;*/
};