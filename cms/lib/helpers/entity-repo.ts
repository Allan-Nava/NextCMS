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
import { Prisma } from '@prisma/client'
//
export const entityRepo = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
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
    let body : Prisma.EntityCreateInput = {
        name: title,
        attribute: JSON.stringify({})
    }
    const entity  = await prisma.entity.create({ 
        data : body
    });
    return entity
}
//
async function update(id: number, title : string) {
    console.log("title", title);
    let body : Prisma.EntityUpdateInput = {
        name: title,
        attribute: JSON.stringify({})
    }
    const entity  = await prisma.entity.update({ 
        data : body, where : {id: id}
    });
    return entity
}
//
async function _delete( id : string ) {
    // need to understand if need to update the field deleted_at
    return await prisma.entity.delete({
        where: { "id": parseInt(id) }
    });
}
//