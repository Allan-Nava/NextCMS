/*
 * File: component-repo.ts
 * Project: next-cms
 * File Created: Saturday, 23rd April 2022 12:30:05 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 9:40:21 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import prisma from '../prisma';
import { PageComponent } from '../types/page';
import { Prisma } from '@prisma/client'
//
export const componentRepo = {
    getAll,
    getById,
    create,
    //update,
    //delete: _delete
};
//
async function getAll() {
    return await prisma.component.findMany();
}
//
async function getById( id : string ) {
    return await prisma.component.findUnique({
        where: { "id": parseInt(id) }
    });
}
//
async function create(title : string, path: string) {
    console.log("title", title);
    let bodyComponent : PageComponent= {
        name: title,
        path: path,
        props: {},
        components: [],
        supportNestedComponent: false
    }
    let body : Prisma.ComponentCreateInput = {
        name: title,
        property: JSON.stringify(bodyComponent),
        parent: 1
        //path: PageComponent,
    }
    console.log("bodyComponent", bodyComponent);
    //
    const page  = await prisma.component.create({ 
        data : body
    });
    console.log("createPage", page);
    return page;
}
//