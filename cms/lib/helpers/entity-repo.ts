/*
 * File: entity-repo.ts
 * Project: next-cms
 * File Created: Saturday, 23rd April 2022 3:23:28 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 3:23:31 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import prisma from '../prisma';
//
export const entityRepo = {
    getAll,
    getById,
    create,
    //update,
    //delete: _delete
};

//
async function getAll() {
    console.info("getAll");
    return await prisma.entity.findMany();
}
//
async function getById( id : string ) {
    console.info("getById ", id);
    return await prisma.entity.findUnique({
        where: { "id": parseInt(id) }
    });
}
//
async function create(title : string) {
    console.log("title", title);
    /* need to fix the creation stuff 
    let body = {
        title: title,
    }
    const createPage  = await prisma.entity.create({ 
        data : body
    });*/
}
//