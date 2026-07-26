/*
 * File: page-content.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Turns a stored page into the component list the renderer expects, shared by
// the home page and the catch-all route so they cannot drift apart (NC-18,
// NC-19).
//
import { pagesRepo } from './page-repo';
import { componentRepo } from './component-repo';
import { PageComponent } from '../types/page';
import { logger } from '../utils/logger';
import { isPubliclyVisible } from '../utils/visibility';
//
export { slugFromSegments } from '../utils/slug';
//
export interface RenderedPage {
    slug: string;
    title: string;
    description: string;
    components: PageComponent[];
}
//
// `includeDrafts` exists for a future editor preview (NC-67) and defaults to
// false: an unpublished page must 404 for the public, exactly as it is hidden
// from `GET /api/page` (NC-59).
export async function loadPage(slug: string, options: { includeDrafts?: boolean } = {}): Promise<RenderedPage | null> {
    const page = await pagesRepo.getBySlug(slug);
    if (!page) {
        logger.debug('no page for slug', { slug });
        return null;
    }
    if (!options.includeDrafts && !isPubliclyVisible(page)) {
        logger.debug('slug resolves to content that is not publicly visible', { slug });
        return null;
    }
    // Blocks are fetched for this page only and already ordered by `position`
    // (NC-42) — the previous version read every component in the database and
    // filtered in memory, in whatever order the database returned them.
    const blocks = await componentRepo.getForPage(page.id);
    return {
        slug: page.slug,
        title: page.title,
        description: page.description,
        components: blocks.map(componentRepo.toPageComponent),
    };
}
//
