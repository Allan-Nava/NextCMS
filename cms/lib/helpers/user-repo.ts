/*
 * File: user-repo.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:02:29 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import prisma from '../prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PublicUser, publicUserSelect } from '../types/user';
import { logger } from '../utils/logger';
//
// Every read goes through `publicUserSelect`, so no caller can accidentally
// hand the bcrypt hash to a response (NC-1). Password hashing lives here and
// nowhere else.
//
const BCRYPT_ROUNDS = 12;
//
// Compared against when the username does not exist, so a missing user and a
// wrong password cost roughly the same and cannot be told apart by timing.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO3Zx2Ck2mMs1sMKfPBsx0RAuTiOgHOfa';
//
export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdmin?: boolean;
    isStaff?: boolean;
}
//
export interface UpdateUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
    isStaff?: boolean;
    password?: string;
}
//
export const userRepo = {
    getAll,
    getById,
    getByUsername,
    create,
    verifyCredentials,
    update,
    delete: _delete,
};
//
async function getAll(): Promise<PublicUser[]> {
    return prisma.user.findMany({ select: publicUserSelect, orderBy: { id: 'asc' } });
}
//
async function getById(id: number): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
}
//
async function getByUsername(username: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { username: username.toLowerCase() }, select: publicUserSelect });
}
//
async function create(input: CreateUserInput): Promise<PublicUser> {
    const data: Prisma.UserCreateInput = {
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        password: bcrypt.hashSync(input.password, BCRYPT_ROUNDS),
        firstName: input.firstName,
        lastName: input.lastName,
        isAdmin: input.isAdmin ?? false,
        isStaff: input.isStaff ?? false,
    };
    const user = await prisma.user.create({ data, select: publicUserSelect });
    logger.info('user created', { id: user.id });
    return user;
}
//
// Returns the public user on success and null on failure — it does not throw,
// so callers cannot accidentally turn a wrong password into a 500 (NC-13).
async function verifyCredentials(username: string, password: string): Promise<PublicUser | null> {
    const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!user) {
        bcrypt.compareSync(password, DUMMY_HASH);
        logger.debug('login refused: unknown username');
        return null;
    }
    if (!bcrypt.compareSync(password, user.password)) {
        logger.debug('login refused: wrong password', { id: user.id });
        return null;
    }
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isStaff: user.isStaff,
        updatedAt: user.updatedAt,
    };
}
//
async function update(id: number, patch: UpdateUserInput): Promise<PublicUser> {
    const data: Prisma.UserUpdateInput = {
        updatedAt: new Date(),
    };
    if (patch.email !== undefined) data.email = patch.email.toLowerCase();
    if (patch.firstName !== undefined) data.firstName = patch.firstName;
    if (patch.lastName !== undefined) data.lastName = patch.lastName;
    if (patch.isAdmin !== undefined) data.isAdmin = patch.isAdmin;
    if (patch.isStaff !== undefined) data.isStaff = patch.isStaff;
    if (patch.password !== undefined) data.password = bcrypt.hashSync(patch.password, BCRYPT_ROUNDS);
    const user = await prisma.user.update({ where: { id }, data, select: publicUserSelect });
    logger.info('user updated', { id: user.id });
    return user;
}
//
async function _delete(id: number): Promise<PublicUser> {
    const user = await prisma.user.delete({ where: { id }, select: publicUserSelect });
    logger.info('user deleted', { id });
    return user;
}
//
