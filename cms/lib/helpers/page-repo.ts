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
import { Prisma } from '@prisma/client';
import { tagRepo } from './taxonomy-repo';
import { logger } from '../utils/logger';
import { Pagination } from '../utils/pagination';
//
// Content lives in one table keyed by `type` ("page", "post", …), so pages and
// posts share a slug space and a renderer (NC-41).
//
export const CONTENT_TYPES = ['page', 'post'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
//
// The author is exposed with a NARROWER projection than `publicUserSelect`
// (NC-79): content listings are public, and an author's email address has no
// business being in one. Only what a byline needs.
const authorSelect = { id: true, username: true, firstName: true, lastName: true } as const;
//
// Category and tags are included on every read: the editor and the public
// templates both need them, and a second round trip per page is not worth
// saving three columns.
const withTaxonomy = { category: true, tags: true, author: { select: authorSelect } } as const;
export type PageWithTaxonomy = Prisma.PageGetPayload<{ include: typeof withTaxonomy }>;
//
export interface CreatePageInput {
    authorId?: number | null;
    title: string;
    slug: string;
    description: string;
    type?: string;
    seoTitle?: string;
    seoDescription?: string;
    jsonld?: string;
    categoryId?: number | null;
    tagNames?: string[];
    published?: boolean;
}
//
export type UpdatePageInput = Partial<CreatePageInput>;
//
export interface ListPagesOptions {
    type?: string;
    categoryId?: number;
    categorySlug?: string;
    tagSlug?: string;
    authorId?: number;
    publishedOnly?: boolean;
}
//
export interface PagedPages {
    rows: PageWithTaxonomy[];
    total: number;
}
//
export const pagesRepo = {
    getAll,
    getById,
    getBySlug,
    listSitemapEntries,
    create,
    update,
    delete: _delete,
};
//
function listWhere(options: ListPagesOptions): Prisma.PageWhereInput {
    const where: Prisma.PageWhereInput = { deletedAt: null };
    if (options.type) where.type = options.type;
    if (options.categoryId !== undefined) where.categoryId = options.categoryId;
    if (options.categorySlug) where.category = { slug: options.categorySlug };
    if (options.tagSlug) where.tags = { some: { slug: options.tagSlug } };
    if (options.authorId !== undefined) where.authorId = options.authorId;
    // Public listings must not leak drafts; the editor asks without this flag.
    // `lte: now` and not just `not: null`, so a scheduled post stays out until its
    // time — the same rule as `isPubliclyVisible` (NC-59).
    if (options.publishedOnly) where.publishedAt = { not: null, lte: new Date() };
    return where;
}
//
// Paged, and the count comes from the same `where` in the same round trip
// (NC-78). The previous version returned the whole table.
async function getAll(options: ListPagesOptions = {}, pagination?: Pagination): Promise<PagedPages> {
    const where = listWhere(options);
    const [rows, total] = await Promise.all([
        prisma.page.findMany({
            where,
            include: withTaxonomy,
            // Newest first: a content list is read from the top.
            orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
            skip: pagination?.skip,
            take: pagination?.take,
        }),
        prisma.page.count({ where }),
    ]);
    return { rows, total };
}
//
// Lean projection for the sitemap (NC-69): it needs four columns for every page,
// and pulling the taxonomy relations for each of them would be wasteful. The
// visibility filtering happens in `buildSitemap`, where it is unit-tested.
async function listSitemapEntries(): Promise<
    { slug: string; updatedAt: Date; publishedAt: Date | null; deletedAt: Date | null }[]
> {
    return prisma.page.findMany({
        select: { slug: true, updatedAt: true, publishedAt: true, deletedAt: true },
    });
}
//
async function getById(id: number): Promise<PageWithTaxonomy | null> {
    return prisma.page.findUnique({ where: { id }, include: withTaxonomy });
}
//
async function getBySlug(slug: string): Promise<PageWithTaxonomy | null> {
    return prisma.page.findUnique({ where: { slug }, include: withTaxonomy });
}
//
// `type` is mandatory in the schema and has no default, so it is set here rather
// than left to the caller to forget (NC-25).
async function create(input: CreatePageInput): Promise<PageWithTaxonomy> {
    const tags = await tagRepo.ensureMany(input.tagNames ?? []);
    const data: Prisma.PageCreateInput = {
        title: input.title,
        slug: input.slug,
        description: input.description,
        type: input.type ?? 'page',
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        jsonld: input.jsonld,
        publishedAt: input.published ? new Date() : null,
        author: input.authorId ? { connect: { id: input.authorId } } : undefined,
        category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
        tags: tags.length > 0 ? { connect: tags.map((tag) => ({ id: tag.id })) } : undefined,
    };
    const page = await prisma.page.create({ data, include: withTaxonomy });
    logger.info('page created', { id: page.id, slug: page.slug, type: page.type });
    return page;
}
//
async function update(id: number, patch: UpdatePageInput): Promise<PageWithTaxonomy> {
    const data: Prisma.PageUpdateInput = { updatedAt: new Date() };
    if (patch.title !== undefined) data.title = patch.title;
    if (patch.slug !== undefined) data.slug = patch.slug;
    if (patch.description !== undefined) data.description = patch.description;
    if (patch.type !== undefined) data.type = patch.type;
    if (patch.seoTitle !== undefined) data.seoTitle = patch.seoTitle;
    if (patch.seoDescription !== undefined) data.seoDescription = patch.seoDescription;
    if (patch.jsonld !== undefined) data.jsonld = patch.jsonld;
    // Publishing is a transition, not a timestamp the client gets to pick: an
    // already-published page keeps its original date when re-saved.
    if (patch.published !== undefined) {
        const current = await prisma.page.findUnique({ where: { id }, select: { publishedAt: true } });
        data.publishedAt = patch.published ? (current?.publishedAt ?? new Date()) : null;
    }
    if (patch.categoryId !== undefined) {
        data.category = patch.categoryId === null ? { disconnect: true } : { connect: { id: patch.categoryId } };
    }
    if (patch.tagNames !== undefined) {
        const tags = await tagRepo.ensureMany(patch.tagNames);
        // `set` replaces the whole list, so removing a tag in the editor removes
        // it here too.
        data.tags = { set: tags.map((tag) => ({ id: tag.id })) };
    }
    const page = await prisma.page.update({ where: { id }, data, include: withTaxonomy });
    logger.info('page updated', { id: page.id });
    return page;
}
//
// Soft delete: the schema carries `deletedAt`, and `getAll` filters on it, so a
// removed page stops being listed without losing its visit history.
async function _delete(id: number): Promise<PageWithTaxonomy> {
    const page = await prisma.page.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: withTaxonomy,
    });
    logger.info('page soft-deleted', { id });
    return page;
}
//
