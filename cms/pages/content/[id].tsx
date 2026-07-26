/*
 * File: [id].tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ContentForm, { ContentFormValues, emptyContent, toPayload } from '../../components/content/ContentForm';
import { getContent, updateContent } from '../../lib/crud/ContentCRUD';
//
// Edit a page or a post (NC-41).
const EditContent: NextPage = () => {
    const router = useRouter();
    const id = typeof router.query.id === 'string' ? Number(router.query.id) : null;
    const [values, setValues] = useState<ContentFormValues | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });

    useEffect(() => {
        if (id === null || Number.isNaN(id)) return;
        getContent(id)
            .then(({ data }) => {
                const item = data.data;
                setValues({
                    ...emptyContent,
                    title: item.title,
                    slug: item.slug,
                    description: item.description,
                    type: item.type,
                    categoryId: item.category?.id ?? null,
                    published: item.publishedAt !== null,
                    tagsText: item.tags.map((tag) => tag.name).join(', '),
                });
            })
            .catch(() => setStatus({ kind: 'error', message: 'Could not load that item.' }));
    }, [id]);

    const onSubmit = () => {
        if (id === null || values === null) return;
        setSubmitting(true);
        setStatus({ kind: 'idle' });
        updateContent(id, toPayload(values))
            .then(() => {
                setSubmitting(false);
                setStatus({ kind: 'ok', message: 'Saved.' });
            })
            .catch((err) => {
                setSubmitting(false);
                setStatus({ kind: 'error', message: String(err?.response?.data?.error ?? 'Could not save.') });
            });
    };

    return (
        <div className='container py-5' style={{ maxWidth: '46rem' }}>
            <p className='mb-2'>
                <Link href='/content'>← Content</Link>
            </p>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3 mb-0'>Edit content</h1>
                {id !== null && (
                    <Link href={`/page-builder?page=${id}`}>
                        <a className='btn btn-outline-secondary'>Edit layout</a>
                    </Link>
                )}
            </div>
            {status.kind === 'ok' && <div className='alert alert-success'>{status.message}</div>}
            {status.kind === 'error' && <div className='alert alert-danger'>{status.message}</div>}
            {values === null ? (
                <p>Loading…</p>
            ) : (
                <ContentForm
                    values={values}
                    onChange={setValues}
                    onSubmit={onSubmit}
                    submitting={submitting}
                    submitLabel='Save changes'
                />
            )}
        </div>
    );
};
//
export default EditContent;
//
