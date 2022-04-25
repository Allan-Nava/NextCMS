/*
 * File: user-repo.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:02:29 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:02:33 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import prisma from '../prisma';
import { Prisma } from '@prisma/client'
//
export const userRepo = {
    getAll,
    getById,
    create,
    //update,
    //delete: _delete
};
//
//
async function getAll() {
    console.info("getAll");
    return await prisma.user.findMany();
}
//
async function getById( id : string ) {
    console.info("getById ", id);
    return await prisma.user.findUnique({
        where: { "id": parseInt(id) }
    });
}
//
//
async function create(username : string, email: string, firstName: string, lastName: string, isAdmin:  boolean, isStaff: boolean,) {
    console.log("username", username);
    let body : Prisma.UserCreateInput = {
        username: username,
        email: email,
        firstName: firstName,
        lastName: lastName,
        isAdmin: isAdmin,
        isStaff: isStaff
        //path: PageComponent,
    }
    console.log("bodyComponent", body);
    //
    const page  = await prisma.user.create({ 
        data : body
    });
    console.log("createPage", page);
    return page;
}
//