/*
 * File: content.tsx
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Layout from '../components/admin/common/layout';
import EntityTable from '../components/admin/common/EntityTable';
import { ApiError, ContentSummary, content } from '../lib/crud/AdminAPI';
//
// Content overview (NC-43).
//
// Read-only on purpose: the editing screens live in the cms app, at /content and
// /page-builder, and duplicating those forms here would mean two implementations
// of the same validation. The links below go there. Consolidating the two
// surfaces is follow-up work — NC-76.
const TYPES = [
    { value: '', label: 'All' },
    { value: 'page', label: 'Pages' },
    { value: 'post', label: 'Posts' },
];
//
const ContentPage: NextPage = () => {
    const [type, setType] = useState('');
    const [rows, setRows] = useState<ContentSummary[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const cmsOrigin = process.env.CMS_ORIGIN ?? '';

    const load = useCallback(() => {
        setError(null);
        setRows(null);
        content
            .list(type || undefined)
            .then(setRows)
            .catch((err: ApiError) => setError(err.message));
    }, [type]);

    useEffect(load, [load]);

    return (
        <Layout title='Content'>
            <div className='btn-group btn-group-sm mb-3' role='group' aria-label='Filter by type'>
                {TYPES.map((option) => (
                    <button
                        key={option.value}
                        type='button'
                        className={`btn btn-outline-secondary${type === option.value ? ' active' : ''}`}
                        onClick={() => setType(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <EntityTable
                rows={rows}
                error={error}
                empty='No content yet.'
                columns={[
                    { header: 'Title', render: (row) => row.title },
                    { header: 'Slug', render: (row) => <code>{row.slug}</code> },
                    { header: 'Type', render: (row) => row.type },
                    {
                        header: 'Status',
                        render: (row) =>
                            row.publishedAt ? (
                                <span className='badge bg-success'>published</span>
                            ) : (
                                <span className='badge bg-secondary'>draft</span>
                            ),
                    },
                    { header: 'Category', render: (row) => row.category?.name ?? '—' },
                    {
                        header: 'Tags',
                        render: (row) => (row.tags.length > 0 ? row.tags.map((tag) => tag.name).join(', ') : '—'),
                    },
                    {
                        header: 'Edit in cms',
                        align: 'end',
                        render: (row) => (
                            <>
                                <a
                                    className='btn btn-sm btn-outline-primary me-2'
                                    href={`${cmsOrigin}/content/${row.id}`}
                                >
                                    Fields
                                </a>
                                <a
                                    className='btn btn-sm btn-outline-secondary'
                                    href={`${cmsOrigin}/page-builder?page=${row.id}`}
                                >
                                    Layout
                                </a>
                            </>
                        ),
                    },
                ]}
            />
            <p className='text-muted small'>
                Editing happens in the cms app so the forms and their validation exist once. Consolidating the two
                surfaces is tracked as NC-76.
            </p>
        </Layout>
    );
};
//
export default ContentPage;
//
