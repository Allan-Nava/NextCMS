/*
 * File: page-repo.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 8:54:55 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 3:21:28 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//const fs = require('fs');
//let users = require('data/users.json');
import prisma from '../prisma';
import { Prisma } from '@prisma/client'
//
export const pagesRepo = {
    getAll,
    getById,
    create,
    getBySlug,
    //update,
    //delete: _delete
};
//
async function getAll() {
    console.info("getAll");
    return await prisma.page.findMany();
}
//
async function getById( id : string ) {
    console.info("getById ", id);
    return await prisma.page.findUnique({
        where: { "id": parseInt(id) }
    });
}
//
async function getBySlug( slug : string ) {
    console.info("getBySlug ", slug);
    return await prisma.page.findUnique({
        where: { "slug": slug }
    });
}
//
async function create(title : string, slug : string, description : string,) {
    console.log("title", title);
    //
    let body : Prisma.PageCreateInput = {
        title: title,
        slug: slug,
        description: description,
    }
    const page  = await prisma.page.create({data: body});
}
//