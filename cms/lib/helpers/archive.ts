/*
 * File: archive.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Archive listings (NC-80).
//
// Categories and tags could be created, assigned and filtered through the API, and
// no public page listed content by either: a visitor could only reach content by
// its exact slug. This is the missing half of the taxonomy work from NC-41.
//
import prisma from '../prisma';
import { pagesRepo } from './page-repo';
import { Pagination, PaginationMeta, paginationMeta } from '../utils/pagination';
import { SeoMetadata, buildSeo } from '../utils/seo';
import { envOrDefault } from '../utils/env';
//
export interface ArchiveItem {
    slug: string;
    title: string;
    description: string;
    publishedAt: string | null;
    author: string | null;
    category: { name: string; slug: string } | null;
    tags: { name: string; slug: string }[];
}
//
export interface Archive {
    heading: string;
    items: ArchiveItem[];
    meta: PaginationMeta;
    seo: SeoMetadata;
}
//
export type ArchiveKind = { kind: 'type'; value: string } | { kind: 'category'; value: string } | { kind: 'tag'; value: string };
//
// Public archives never include drafts or scheduled content: the filter goes
// through the same `publishedOnly` path as the API (NC-59).
export async function loadArchive(target: ArchiveKind, pagination: Pagination): Promise<Archive | null> {
    const heading = await resolveHeading(target);
    // An unknown category or tag is a 404, not an empty list: otherwise every
    // typo'd URL would render a valid-looking empty page.
    if (heading === null) return null;

    const { rows, total } = await pagesRepo.getAll(
        {
            publishedOnly: true,
            type: target.kind === 'type' ? target.value : undefined,
            categorySlug: target.kind === 'category' ? target.value : undefined,
            tagSlug: target.kind === 'tag' ? target.value : undefined,
        },
        pagination
    );

    const slug = archiveSlug(target);
    return {
        heading,
        items: rows.map((row) => ({
            slug: row.slug,
            title: row.title,
            description: row.description,
            // Dates cross the serialisation boundary to the page, so they go as
            // strings rather than relying on Next to handle a Date.
            publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
            author: row.author ? `${row.author.firstName} ${row.author.lastName}`.trim() || row.author.username : null,
            category: row.category ? { name: row.category.name, slug: row.category.slug } : null,
            tags: row.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
        })),
        meta: paginationMeta(total, pagination),
        seo: buildSeo(
            {
                title: heading,
                description: `${heading} — ${total} item${total === 1 ? '' : 's'}`,
                slug,
                type: 'page',
                // An archive is always public, so it is always indexable.
                publishedAt: new Date(0),
                updatedAt: new Date(),
            },
            { baseUrl: envOrDefault('BASE_URI', ''), siteName: envOrDefault('SITE_NAME', 'NextCMS') }
        ),
    };
}
//
export function archiveSlug(target: ArchiveKind): string {
    if (target.kind === 'type') return target.value === 'post' ? '/posts' : `/type/${target.value}`;
    return `/${target.kind}/${target.value}`;
}
//
async function resolveHeading(target: ArchiveKind): Promise<string | null> {
    if (target.kind === 'type') {
        return target.value === 'post' ? 'Posts' : `${target.value} archive`;
    }
    if (target.kind === 'category') {
        const category = await prisma.category.findUnique({ where: { slug: target.value } });
        return category && category.deletedAt === null ? category.name : null;
    }
    const tag = await prisma.tag.findUnique({ where: { slug: target.value } });
    return tag && tag.deletedAt === null ? tag.name : null;
}
//
