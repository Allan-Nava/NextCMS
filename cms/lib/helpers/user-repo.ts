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
import { Prisma } from '@prisma/client';
//import bcryptjs  from "bcryptjs";
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
//
//
export const userRepo = {
    getAll,
    getById,
    create,
    login,
    update,
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
async function create(username : string, email: string, password: string, firstName: string, lastName: string, isAdmin:  boolean, isStaff: boolean,) {
    console.log("username", username);
    password = bcrypt.hashSync(password, 8);
    // need to hash the password
    let body : Prisma.UserCreateInput = {
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        isAdmin: isAdmin,
        isStaff: isStaff
        //path: PageComponent,
    }
    console.log("bodyComponent", body);
    //
    const user  = await prisma.user.create({ 
        data : body
    });
    console.log("createUser", user);
    return user;
}
//
async function login(username : string, password: string ){
    //
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        throw new Error('User not registered');
    }
    const checkPassword = bcrypt.compareSync(password, user.password)
    if (!checkPassword) throw new Error('Email address or password not valid')
    //
    var token = jwt.sign(user, 'shhhhh'); // need to change the private key
    console.log("token", token);
    return token;
};
//

async function update(username : string, email?: string, firstName?: string, lastName?: string, isAdmin?:  boolean, isStaff?: boolean,) {
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        throw new Error('User not registered');
    }
    //
}