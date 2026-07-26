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
import { loadPage } from '../lib/helpers/page-content';
import { PageComponent } from '../lib/types/page';
//
interface IndexProps {
    components: PageComponent[];
}
//
// Home page: the "/" slug, rendered from the database like any other page.
//
// The previous version fetched the page and then ignored it, rendering a
// hardcoded navbar/hero/features list instead (NC-19).
const Index: NextPage<IndexProps> = ({ components }) => {
    return <DynamicComponents page={components} />;
};
//
export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
    const page = await loadPage('/');
    // An empty home page is a valid state for a fresh install — no 404 here.
    return { props: { components: page?.components ?? [] } };
};
//
export default Index;
//
