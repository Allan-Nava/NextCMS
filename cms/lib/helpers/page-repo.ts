/*
 * File: page-repo.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 8:54:55 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 10:53:04 am
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
    update,
    delete: _delete
};
//
async function getAll() {
    const pages = await prisma.page.findMany();
    console.info("getAll ", pages);
    return pages;
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
    const page = await prisma.page.findUnique({
        where: { "slug": slug }
    });
    console.info("getBySlug ", page);
    return page;
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
    return page;
}
//
async function update(id: number, title : string, slug : string, description : string,) {
    console.log("title", title);
    //
    let body : Prisma.PageUpdateInput = {
        title: title,
        slug: slug,
        description: description,
    }
    const page  = await prisma.page.update({data: body, where: {id: id }});
}
//
async function _delete( id : string ) {
    return await prisma.page.delete({
        where: { "id": parseInt(id) }
    });
}
//