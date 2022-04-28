/*
 * File: user-request.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:29:02 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:29:06 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { NextApiRequest, NextApiResponse } from 'next';
//
//
export interface UserNextApiRequest extends NextApiRequest {
    body: {
      username: string;
    };
}
//
//
export interface UserCreateNextApiRequest extends NextApiRequest {
    body: {
      username: string;
      email?: string;
      password: string;
      firstName: string;
      lastName: string;
    };
}
//
export interface UserDetailNextApiRequest extends NextApiRequest {
  body: {
    id: string;
  };
}