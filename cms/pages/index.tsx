/*
 * File: index.tsx
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:42:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps, NextPage } from 'next';
import DynamicComponents from '../components/DynamicComponents';
import Seo from '../components/Seo';
import { loadPage } from '../lib/helpers/page-content';
import { PageComponent } from '../lib/types/page';
import { SeoMetadata, buildSeo } from '../lib/utils/seo';
//
interface IndexProps {
    components: PageComponent[];
    seo: SeoMetadata;
}
//
// Home page: the "/" slug, rendered from the database like any other page.
//
// The previous version fetched the page and then ignored it, rendering a
// hardcoded navbar/hero/features list instead (NC-19).
const Index: NextPage<IndexProps> = ({ components, seo }) => {
    return (
        <>
            <Seo seo={seo} />
            <DynamicComponents page={components} />
        </>
    );
};
//
export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
    const page = await loadPage('/');
    // An empty home page is a valid state for a fresh install — no 404 here. It
    // still needs a head, so a placeholder is built when there is no row yet.
    const seo =
        page?.seo ??
        buildSeo(
            {
                title: 'NextCMS',
                description: 'This site has no home page yet.',
                slug: '/',
                type: 'page',
                publishedAt: null,
                updatedAt: new Date(0),
            },
            { baseUrl: process.env.BASE_URI ?? '' }
        );
    return { props: { components: page?.components ?? [], seo } };
};
//
export default Index;
//
