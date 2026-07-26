/*
 * File: taxonomy-repo.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Categories and tags (NC-41). Both are the same shape — a name and a slug —
// so they share one module rather than two copies of the same six functions.
//
import prisma from '../prisma';
import { Category, Prisma, Tag } from '@prisma/client';
import { logger } from '../utils/logger';
import { slugify } from '../utils/slug';
//
export interface TaxonomyInput {
    name: string;
    slug?: string;
}
//
export const categoryRepo = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};
//
async function getAll(): Promise<Category[]> {
    return prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
}
//
async function getById(id: number): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
}
//
// The slug is derived from the name when the caller does not supply one, so a
// category is usable without the client having to know the slug rules.
async function create(input: TaxonomyInput): Promise<Category> {
    const data: Prisma.CategoryCreateInput = { name: input.name, slug: input.slug ?? slugify(input.name) };
    const category = await prisma.category.create({ data });
    logger.info('category created', { id: category.id });
    return category;
}
//
async function update(id: number, input: TaxonomyInput): Promise<Category> {
    const category = await prisma.category.update({
        where: { id },
        data: { name: input.name, slug: input.slug ?? slugify(input.name), updatedAt: new Date() },
    });
    logger.info('category updated', { id });
    return category;
}
//
async function _delete(id: number): Promise<Category> {
    const category = await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
    logger.info('category soft-deleted', { id });
    return category;
}
//
export const tagRepo = {
    getAll: getAllTags,
    getById: getTagById,
    create: createTag,
    update: updateTag,
    delete: deleteTag,
    ensureMany,
};
//
async function getAllTags(): Promise<Tag[]> {
    return prisma.tag.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
}
//
async function getTagById(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({ where: { id } });
}
//
async function createTag(input: TaxonomyInput): Promise<Tag> {
    const data: Prisma.TagCreateInput = { name: input.name, slug: input.slug ?? slugify(input.name) };
    const tag = await prisma.tag.create({ data });
    logger.info('tag created', { id: tag.id });
    return tag;
}
//
async function updateTag(id: number, input: TaxonomyInput): Promise<Tag> {
    const tag = await prisma.tag.update({
        where: { id },
        data: { name: input.name, slug: input.slug ?? slugify(input.name), updatedAt: new Date() },
    });
    logger.info('tag updated', { id });
    return tag;
}
//
async function deleteTag(id: number): Promise<Tag> {
    const tag = await prisma.tag.update({ where: { id }, data: { deletedAt: new Date() } });
    logger.info('tag soft-deleted', { id });
    return tag;
}
//
// Turns a list of tag names into tag rows, creating the ones that do not exist.
// Content editors type tag names; they should not have to create each tag first.
async function ensureMany(names: string[]): Promise<Tag[]> {
    const wanted = Array.from(new Set(names.map((name) => name.trim()).filter((name) => name.length > 0)));
    if (wanted.length === 0) return [];
    const slugs = wanted.map(slugify);
    const existing = await prisma.tag.findMany({ where: { slug: { in: slugs } } });
    const bySlug = new Map(existing.map((tag) => [tag.slug, tag]));
    const created: Tag[] = [];
    for (const name of wanted) {
        const slug = slugify(name);
        if (bySlug.has(slug)) continue;
        created.push(await prisma.tag.create({ data: { name, slug } }));
    }
    return [...existing, ...created];
}
//
