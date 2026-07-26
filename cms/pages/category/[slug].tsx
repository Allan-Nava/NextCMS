/*
 * File: [slug].tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps, NextPage } from 'next';
import ArchiveList from '../../components/archive/ArchiveList';
import { Archive, loadArchive } from '../../lib/helpers/archive';
import { parsePagination } from '../../lib/utils/pagination';
//
// Archive of one category (NC-80). An unknown slug is a 404 rather than an empty page,
// so a typo'd URL does not look like a real archive that happens to be empty.
const CategoryArchive: NextPage<{ archive: Archive; basePath: string }> = ({ archive, basePath }) => (
    <ArchiveList archive={archive} basePath={basePath} />
);
//
export const getServerSideProps: GetServerSideProps = async (context) => {
    const slug = typeof context.params?.slug === 'string' ? context.params.slug : null;
    if (!slug) return { notFound: true };
    const archive = await loadArchive(
        { kind: 'category', value: slug },
        parsePagination(context.query, { defaultPerPage: 10 })
    );
    if (!archive) return { notFound: true };
    return { props: { archive, basePath: `/category/${slug}` } };
};
//
export default CategoryArchive;
//
