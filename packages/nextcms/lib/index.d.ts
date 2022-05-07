/*
 * File: index.d.ts
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 6:10:31 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:10:35 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

export type NextCMS = NextCMSInterface;

declare global {
  interface AllTypes {}
}

declare global {
  export interface Global {
    nextCMS: NextCMSInterface;
  }

  export type NextCMS = NextCMSInterface;

  const nextCMS: NextCMSInterface;
}

export default function(opts): NextCMS;