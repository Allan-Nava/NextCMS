/*
 * File: sitemap.xml.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import { pagesRepo } from '../lib/helpers/page-repo';
import { buildSitemap } from '../lib/utils/sitemap';
import { envOrDefault } from '../lib/utils/env';
import { logger } from '../lib/utils/logger';
//
// GET /sitemap.xml (NC-69).
//
// Written straight to the response: there is no page to render, and the document
// is generated per request so a newly published page appears without a rebuild.
// The filtering — drafts, scheduled and soft-deleted content — is `buildSitemap`'s
// job and is unit-tested there.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    try {
        const [entries, categories, tags] = await Promise.all([
            pagesRepo.listSitemapEntries(),
            prisma.category.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
            prisma.tag.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
        ]);
        // The archive routes are real URLs now (NC-80), so they belong here. They
        // are always visible: an archive has no draft state of its own.
        const visible = { publishedAt: new Date(0), deletedAt: null };
        const archives = [
            { slug: '/posts', updatedAt: new Date(), ...visible },
            ...categories.map((c) => ({ slug: `/category/${c.slug}`, updatedAt: c.updatedAt, ...visible })),
            ...tags.map((t) => ({ slug: `/tag/${t.slug}`, updatedAt: t.updatedAt, ...visible })),
        ];
        const xml = buildSitemap([...entries, ...archives], { baseUrl: envOrDefault('BASE_URI', '') });
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        // Short public cache: crawlers poll this, and a stale entry for a few
        // minutes is harmless.
        res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
        res.write(xml);
        res.end();
    } catch (error) {
        logger.error('sitemap generation failed', {
            reason: error instanceof Error ? error.message : String(error),
        });
        res.statusCode = 500;
        res.end();
    }
    return { props: {} };
};
//
// Next requires a default export for a page module; this one never renders.
export default function Sitemap(): null {
    return null;
}
//
