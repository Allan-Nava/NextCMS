/*
 * File: posts.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps, NextPage } from 'next';
import ArchiveList from '../components/archive/ArchiveList';
import { Archive, loadArchive } from '../lib/helpers/archive';
import { parsePagination } from '../lib/utils/pagination';
//
// The post listing (NC-80). Content of type "post" had nowhere to be listed.
const Posts: NextPage<{ archive: Archive; basePath: string }> = ({ archive, basePath }) => (
    <ArchiveList archive={archive} basePath={basePath} />
);
//
export const getServerSideProps: GetServerSideProps = async (context) => {
    const archive = await loadArchive({ kind: 'type', value: 'post' }, parsePagination(context.query, { defaultPerPage: 10 }));
    if (!archive) return { notFound: true };
    return { props: { archive, basePath: '/posts' } };
};
//
export default Posts;
//
