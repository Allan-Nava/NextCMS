/*
 * File: page-repo.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 8:54:55 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Friday, 22nd April 2022 8:55:03 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//const fs = require('fs');
//let users = require('data/users.json');
import prisma from '../prisma';
//
export const pagesRepo = {
    getAll,
    getById,
    create,
    //update,
    //delete: _delete
};
//
async function getAll() {
    return await prisma.page.findMany();
}
//
async function getById( id : string ) {
    return await prisma.page.findUnique({
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
    const createPage  = await prisma.page.create({ 
        data : body
    });*/
}
//