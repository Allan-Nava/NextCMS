/*
 * File: feed.xml.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps } from 'next';
import { pagesRepo } from '../lib/helpers/page-repo';
import { FEED_LIMIT, buildFeed } from '../lib/utils/feed';
import { parsePagination } from '../lib/utils/pagination';
import { envOrDefault } from '../lib/utils/env';
import { logger } from '../lib/utils/logger';
//
// GET /feed.xml (NC-84).
//
// Only `type=post` belongs in a feed: pages are the furniture of a site, posts are
// what someone subscribes to. Generated per request, so a newly published post
// appears without a rebuild.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    try {
        // Ask for exactly what the feed can hold; the builder caps again, so an
        // off-by-one here cannot produce an oversized document.
        const { rows } = await pagesRepo.getAll(
            { type: 'post', publishedOnly: true },
            parsePagination({ perPage: String(FEED_LIMIT) })
        );
        const xml = buildFeed(rows, {
            baseUrl: envOrDefault('BASE_URI', ''),
            siteName: envOrDefault('SITE_NAME', 'NextCMS'),
        });
        if (xml === null) {
            // A feed with relative links is broken rather than degraded, so this
            // says so instead of serving one.
            logger.warn('feed not served: BASE_URI is not configured');
            res.statusCode = 503;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Feed unavailable: BASE_URI is not configured.\n');
            return { props: {} };
        }
        res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
        res.write(xml);
        res.end();
    } catch (error) {
        logger.error('feed generation failed', {
            reason: error instanceof Error ? error.message : String(error),
        });
        res.statusCode = 500;
        res.end();
    }
    return { props: {} };
};
//
export default function Feed(): null {
    return null;
}
//
