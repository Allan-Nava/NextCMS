/*
 * File: component-repo.ts
 * Project: next-cms
 * File Created: Saturday, 23rd April 2022 12:30:05 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 10:53:10 am
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
    update,
    delete: _delete
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
async function update( id : number ,name : string, path: string) {
    console.log("name", name);
    let bodyComponent : PageComponent= {
        name: name,
        path: path,
        props: {},
        components: [],
        supportNestedComponent: false
    }
    let body : Prisma.ComponentUpdateInput = {
        name: name,
        property: JSON.stringify(bodyComponent),
        parent: 1
        //path: PageComponent,
    }
    console.log("bodyComponent", bodyComponent);
    //
    const component  = await prisma.component.update({data: body, where: {id: id }});
    console.log("updaComponent", component);
    return component;
}
//
async function _delete( id : string ) {
    return await prisma.component.delete({
        where: { "id": parseInt(id) }
    });
}
//