/*
 * File: component-request.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:36:36 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:36:38 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import type { NextApiRequest, NextApiResponse } from 'next';
//
//
export interface ComponentNextApiRequest extends NextApiRequest {
    body: {
        name: string;
    };
}
//