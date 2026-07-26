/*
 * File: role-repo.ts
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:02:44 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import prisma from '../prisma';
import { Prisma, Role } from '@prisma/client';
import { logger } from '../utils/logger';
import { Pagination } from '../utils/pagination';
//
// `update` and `delete` were missing entirely, so the API had no way to maintain
// a role once created (NC-22).
export const roleRepo = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};
//
// Paged (NC-78).
async function getAll(pagination?: Pagination): Promise<{ rows: Role[]; total: number }> {
    const where = { deletedAt: null };
    const [rows, total] = await Promise.all([
        prisma.role.findMany({ where, orderBy: { id: 'asc' }, skip: pagination?.skip, take: pagination?.take }),
        prisma.role.count({ where }),
    ]);
    return { rows, total };
}
//
async function getById(id: number): Promise<Role | null> {
    return prisma.role.findUnique({ where: { id } });
}
//
async function create(name: string): Promise<Role> {
    const data: Prisma.RoleCreateInput = { name };
    const role = await prisma.role.create({ data });
    logger.info('role created', { id: role.id, name: role.name });
    return role;
}
//
async function update(id: number, name: string): Promise<Role> {
    const role = await prisma.role.update({ where: { id }, data: { name, updatedAt: new Date() } });
    logger.info('role updated', { id: role.id });
    return role;
}
//
async function _delete(id: number): Promise<Role> {
    const role = await prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
    logger.info('role soft-deleted', { id });
    return role;
}
//
