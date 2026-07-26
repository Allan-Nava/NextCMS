/*
 * File: index.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { ContentSummary, deleteContent, listContent } from '../../lib/crud/ContentCRUD';
//
// Content list (NC-41): pages and posts in one place, filtered by type.
//
// Behind the middleware — the API returns drafts only to an authenticated
// caller, and an editor that silently hid half the content would be confusing.
const TYPES = [
    { value: '', label: 'All' },
    { value: 'page', label: 'Pages' },
    { value: 'post', label: 'Posts' },
];
//
const ContentList: NextPage = () => {
    const [type, setType] = useState('');
    const [items, setItems] = useState<ContentSummary[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setError(null);
        listContent(type || undefined)
            .then(({ data }) => setItems(data.data))
            .catch(() => setError('Could not load the content list.'));
    }, [type]);

    useEffect(load, [load]);

    const onDelete = (item: ContentSummary) => {
        // Deletes are soft, but they still remove the item from every listing.
        if (!window.confirm(`Delete “${item.title}”?`)) return;
        deleteContent(item.id)
            .then(load)
            .catch(() => setError('Could not delete that item.'));
    };

    return (
        <div className='container py-5'>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3 mb-0'>Content</h1>
                <Link href='/content/new'>
                    <a className='btn btn-primary'>New</a>
                </Link>
            </div>

            <div className='btn-group mb-4' role='group' aria-label='Filter by type'>
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

            {error && <div className='alert alert-danger'>{error}</div>}

            {items === null ? (
                <p>Loading…</p>
            ) : items.length === 0 ? (
                <p className='text-muted'>Nothing here yet.</p>
            ) : (
                <div className='table-responsive'>
                    <table className='table align-middle'>
                        <thead>
                            <tr>
                                <th scope='col'>Title</th>
                                <th scope='col'>Slug</th>
                                <th scope='col'>Type</th>
                                <th scope='col'>Status</th>
                                <th scope='col'>Category</th>
                                <th scope='col'>Tags</th>
                                <th scope='col' className='text-end'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>
                                        <code>{item.slug}</code>
                                    </td>
                                    <td>{item.type}</td>
                                    <td>
                                        {item.publishedAt ? (
                                            <span className='badge bg-success'>published</span>
                                        ) : (
                                            <span className='badge bg-secondary'>draft</span>
                                        )}
                                    </td>
                                    <td>{item.category?.name ?? '—'}</td>
                                    <td>{item.tags.length > 0 ? item.tags.map((tag) => tag.name).join(', ') : '—'}</td>
                                    <td className='text-end'>
                                        <Link href={`/content/${item.id}`}>
                                            <a className='btn btn-sm btn-outline-primary me-2'>Edit</a>
                                        </Link>
                                        <Link href={`/page-builder?page=${item.id}`}>
                                            <a className='btn btn-sm btn-outline-secondary me-2'>Layout</a>
                                        </Link>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-outline-danger'
                                            onClick={() => onDelete(item)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
//
export default ContentList;
//
