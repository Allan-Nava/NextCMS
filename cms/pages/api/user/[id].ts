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
import { userRepo } from '../../../lib/helpers/user-repo';
import { UserCreateNextApiRequest, UserDetailNextApiRequest } from '../../../lib/types/request/user-request';
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.query.id;
    //
    if (req.method === 'GET') {
      //handleGET(userId, res)
      getUser(req);
    } else if (req.method === 'DELETE') {
      handleDELETE(userId, res);
    } else {
      throw new Error(
        `The HTTP ${req.method} method is not supported at this route.`
      )
    }

    //
    async function getUser(req : UserDetailNextApiRequest) {
      try {
          console.log("req.body ", req.body);
          // req.body.email?
          let user = await userRepo.getById(req.body.id);
          return res.status(200).json(user);
      } catch (error) {
          return res.status(400).json({ message: error });
      }
  }
  //
}

// GET /api/user/:id
/*async function handleGET(userId : string , res: NextApiResponse) {
  const users = await userRepo.getById(userId);
  return res.status(200).json(users);
}*/
  
// DELETE /api/user/:id
async function handleDELETE(userId : string|string[] , res: NextApiResponse) {
    // need to create the safe delete 
    /*const data = await prisma.user.delete({
        where: { id: Number(userId) },
    })
    res.json(data);*/
}