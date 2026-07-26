/*
 * File: [...index].tsx
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:04:25 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps, NextPage } from 'next';
import DynamicComponents from '../components/DynamicComponents';
import { loadPage, slugFromSegments } from '../lib/helpers/page-content';
import { PageComponent } from '../lib/types/page';
//
interface CatchAllProps {
    components: PageComponent[];
}
//
// Catch-all route: every slug that is not a concrete file lands here.
//
// Two bugs used to make this render nothing (NC-18): `getServerSideProps`
// returned `props: { basePages }` while the component destructured `{ data }`,
// and the slug was taken from `context.req.url` — path plus query string —
// instead of the route segments.
const CatchAllPage: NextPage<CatchAllProps> = ({ components }) => {
    return <DynamicComponents page={components} />;
};
//
export const getServerSideProps: GetServerSideProps<CatchAllProps> = async (context) => {
    const slug = slugFromSegments(context.params?.index as string[] | undefined);
    const page = await loadPage(slug);
    if (!page) {
        return { notFound: true };
    }
    return { props: { components: page.components } };
};
//
export default CatchAllPage;
//
