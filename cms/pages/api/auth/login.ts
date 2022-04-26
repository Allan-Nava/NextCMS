/*
 * File: login.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:55:48 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 25th April 2022 4:55:51 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthLoginNextApiRequest } from '../../../lib/types/request/auth-request';
import { errorResponse, SuccessResponse , successResponse} from './../../../lib/types/response/response';
import { userRepo } from './../../../lib/helpers/user-repo';
//
//
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log("req ", req, "res ", res);
    switch (req.method) {
        case 'POST':
            return authLogin(req);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    //
    async function authLogin(req: AuthLoginNextApiRequest) {
        console.log("req ", req);
        const user = await userRepo.login(req.body.username, req.body.password);
        if (user) {
            /*const response : SuccessResponse = {
                data: user,
                message: "User logged in successfully",
                response: DEFAULTResponse.OK
            }*/
            return res.status(200).json(successResponse(user, "User logged in successfully"));
        }else{
            return res.status(500).json(errorResponse({"error": "user credentials wrong"}) )//.end(`Method ${req.method} Not Allowed`)
        }
    }
}