/*
 * File: role-repo.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:02:44 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:02:47 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import prisma from '../prisma';
import { Prisma } from '@prisma/client'
//
export const roleRepo = {
    getAll,
    getById,
    create,
    //update,
    //delete: _delete
};
//
async function getAll() {
    console.info("getAll");
    return await prisma.role.findMany();
}
//
async function getById( id : string ) {
    console.info("getById ", id);
    return await prisma.role.findUnique({
        where: { "id": parseInt(id) }
    });
}
//
async function create( name: string ) {
    console.log("name", name);
    //
    let body : Prisma.RoleCreateInput = {
        name: name,
    }
    const user  = await prisma.role.create({data: body});
    return user;
}
//