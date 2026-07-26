/*
 * File: page-repo.ts
 * Project: next-cms
 * File Created: Friday, 22nd April 2022 8:54:55 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import prisma from '../prisma';
import { Prisma, Page } from '@prisma/client';
import { logger } from '../utils/logger';
//
export interface CreatePageInput {
    title: string;
    slug: string;
    description: string;
    type?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string;
    jsonld?: string;
}
//
export type UpdatePageInput = Partial<CreatePageInput>;
//
export const pagesRepo = {
    getAll,
    getById,
    getBySlug,
    create,
    update,
    delete: _delete,
};
//
async function getAll(): Promise<Page[]> {
    return prisma.page.findMany({ where: { deletedAt: null }, orderBy: { id: 'asc' } });
}
//
async function getById(id: number): Promise<Page | null> {
    return prisma.page.findUnique({ where: { id } });
}
//
// `slug` is unique, so this is the lookup the public pages use.
async function getBySlug(slug: string): Promise<Page | null> {
    return prisma.page.findUnique({ where: { slug } });
}
//
// `type` is mandatory in the schema and has no default, so it is set here rather
// than left to the caller to forget (NC-25).
async function create(input: CreatePageInput): Promise<Page> {
    const data: Prisma.PageCreateInput = {
        title: input.title,
        slug: input.slug,
        description: input.description,
        type: input.type ?? 'page',
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        tags: input.tags,
        jsonld: input.jsonld,
    };
    const page = await prisma.page.create({ data });
    logger.info('page created', { id: page.id, slug: page.slug });
    return page;
}
//
// Returns the updated row — the previous version returned nothing (NC-22).
async function update(id: number, patch: UpdatePageInput): Promise<Page> {
    const data: Prisma.PageUpdateInput = { updatedAt: new Date() };
    if (patch.title !== undefined) data.title = patch.title;
    if (patch.slug !== undefined) data.slug = patch.slug;
    if (patch.description !== undefined) data.description = patch.description;
    if (patch.type !== undefined) data.type = patch.type;
    if (patch.seoTitle !== undefined) data.seoTitle = patch.seoTitle;
    if (patch.seoDescription !== undefined) data.seoDescription = patch.seoDescription;
    if (patch.tags !== undefined) data.tags = patch.tags;
    if (patch.jsonld !== undefined) data.jsonld = patch.jsonld;
    const page = await prisma.page.update({ where: { id }, data });
    logger.info('page updated', { id: page.id });
    return page;
}
//
// Soft delete: the schema carries `deletedAt`, and `getAll` filters on it, so a
// removed page stops being listed without losing its visit history.
async function _delete(id: number): Promise<Page> {
    const page = await prisma.page.update({ where: { id }, data: { deletedAt: new Date() } });
    logger.info('page soft-deleted', { id });
    return page;
}
//
