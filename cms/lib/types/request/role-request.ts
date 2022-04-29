/*
 * File: role-request.ts
 * Project: next-cms
 * File Created: Friday, 29th April 2022 8:10:01 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Friday, 29th April 2022 8:10:03 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { NextApiRequest, NextApiResponse } from 'next';
//
//
export interface RoleDetailNextApiRequest extends NextApiRequest {
    body: {
      id: string;
    };
  }