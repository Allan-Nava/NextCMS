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
export async function loadPage(slug: string): Promise<RenderedPage | null> {
    const page = await pagesRepo.getBySlug(slug);
    if (!page || page.deletedAt !== null) {
        logger.debug('no page for slug', { slug });
        return null;
    }
    // Components are stored flat and attached to a page through `parent`.
    const components = await componentRepo.getAll();
    const attached = components.filter((component) => component.parent === page.id).map(componentRepo.toPageComponent);
    return {
        slug: page.slug,
        title: page.title,
        description: page.description,
        components: attached,
    };
}
//
