/*
 * File: prisma.ts
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:45:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 19th April 2022 10:47:51 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import { PrismaClient } from '@prisma/client';
//
let prisma: PrismaClient;
//
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  /*if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;*/
  prisma = new PrismaClient();
  //
}
//
export default prisma;
//