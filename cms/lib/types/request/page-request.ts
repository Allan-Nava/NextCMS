/*
 * File: page-request.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:28:00 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:28:02 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
//
//
export interface PageNextApiRequest extends NextApiRequest {
    body: {
      title: string;
    };
}
//
//
export interface PageCreateNextApiRequest extends NextApiRequest {
    body: {
      title: string;
    };
}
//
export interface PageDetailNextApiRequest extends NextApiRequest {
    body: {
      id: string;
    };
}
//
//export default { PageNextApiRequest , CreatePageNextApiRequest  };
//