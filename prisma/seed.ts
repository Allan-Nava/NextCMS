/*
 * File: seed.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 12:33:38 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 12:34:01 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const pageData: Prisma.PageCreateInput[] = [
  {
    title: 'Index',
    seoTitle: 'Index seos',
    description: 'first page example',
    seoDescription: 'Index seo description',
    slug: "/",
  }
]
//
async function main() {
  console.log(`Start seeding ...`);
  for (let p of pageData) {
    let page = await prisma.page.create({
      data: p,
    })
    console.log(`Created user with id: ${page.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
});