/*
 * File: new.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ContentForm, { ContentFormValues, emptyContent, toPayload } from '../../components/content/ContentForm';
import { createContent } from '../../lib/crud/ContentCRUD';
//
// Create a page or a post (NC-41). On success it goes straight to the layout
// editor: a new page with no blocks renders empty, so composing it is the
// natural next step.
const NewContent: NextPage = () => {
    const router = useRouter();
    const [values, setValues] = useState<ContentFormValues>(emptyContent);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = () => {
        setSubmitting(true);
        setError(null);
        createContent(toPayload(values))
            .then(({ data }) => router.push(`/page-builder?page=${data.data.id}`))
            .catch((err) => {
                setSubmitting(false);
                setError(String(err?.response?.data?.error ?? 'Could not create the content.'));
            });
    };

    return (
        <div className='container py-5' style={{ maxWidth: '46rem' }}>
            <p className='mb-2'>
                <Link href='/content'>← Content</Link>
            </p>
            <h1 className='h3 mb-4'>New content</h1>
            {error && <div className='alert alert-danger'>{error}</div>}
            <ContentForm
                values={values}
                onChange={setValues}
                onSubmit={onSubmit}
                submitting={submitting}
                submitLabel='Create and edit layout'
            />
        </div>
    );
};
//
export default NewContent;
//
