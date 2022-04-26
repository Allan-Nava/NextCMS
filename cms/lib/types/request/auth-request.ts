/*
 * File: auth-request.ts
 * Project: next-cms
 * File Created: Monday, 25th April 2022 4:57:00 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 25th April 2022 8:08:05 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { NextApiRequest, NextApiResponse } from 'next';
//
//
export interface AuthLoginNextApiRequest extends NextApiRequest {
    body: {
        username: string;
        password: string;
    };
}
//
//
export interface AuthRegisterNextApiRequest extends NextApiRequest {
    body: {
        username: string;
        password: string;
        firstName: string;
        lastName: string;  
        //isAdmin : boolean?;
        //isStaff : boolean?;
    };
}