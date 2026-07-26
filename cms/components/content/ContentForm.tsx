/*
 * File: ContentForm.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React, { useEffect, useState } from 'react';
import { ContentPayload, Taxonomy, listCategories } from '../../lib/crud/ContentCRUD';
//
// Shared create/edit form (NC-41), so the two screens cannot drift apart in what
// they accept.
//
// Tags are entered as free text and resolved server-side: the API creates the
// ones that do not exist yet, so an editor never has to create a tag first.
export interface ContentFormValues extends ContentPayload {
    tagsText: string;
}
//
export const emptyContent: ContentFormValues = {
    title: '',
    slug: '/',
    description: '',
    type: 'page',
    seoTitle: '',
    seoDescription: '',
    categoryId: null,
    published: false,
    tagsText: '',
};
//
export function toPayload(values: ContentFormValues): ContentPayload {
    return {
        title: values.title,
        slug: values.slug,
        description: values.description,
        type: values.type,
        seoTitle: values.seoTitle || undefined,
        seoDescription: values.seoDescription || undefined,
        categoryId: values.categoryId ?? null,
        published: values.published,
        tagNames: values.tagsText
            .split(',')
            .map((name) => name.trim())
            .filter((name) => name.length > 0),
    };
}
//
const ContentForm: React.FC<{
    values: ContentFormValues;
    onChange: (values: ContentFormValues) => void;
    onSubmit: () => void;
    submitting: boolean;
    submitLabel: string;
}> = ({ values, onChange, onSubmit, submitting, submitLabel }) => {
    const [categories, setCategories] = useState<Taxonomy[]>([]);

    useEffect(() => {
        // A missing category list is not fatal: the field just stays empty.
        listCategories()
            .then(({ data }) => setCategories(data.data))
            .catch(() => setCategories([]));
    }, []);

    const set = <K extends keyof ContentFormValues>(key: K, value: ContentFormValues[K]) =>
        onChange({ ...values, [key]: value });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className='mb-3'>
                <label className='form-label' htmlFor='title'>
                    Title
                </label>
                <input
                    id='title'
                    className='form-control'
                    value={values.title}
                    onChange={(event) => set('title', event.target.value)}
                    required
                />
            </div>

            <div className='row'>
                <div className='col-md-8 mb-3'>
                    <label className='form-label' htmlFor='slug'>
                        Slug
                    </label>
                    <input
                        id='slug'
                        className='form-control'
                        value={values.slug}
                        onChange={(event) => set('slug', event.target.value)}
                        pattern='/.*'
                        required
                    />
                    <div className='form-text'>Must start with “/”. This is the public URL of the content.</div>
                </div>
                <div className='col-md-4 mb-3'>
                    <label className='form-label' htmlFor='type'>
                        Type
                    </label>
                    <select
                        id='type'
                        className='form-select'
                        value={values.type}
                        onChange={(event) => set('type', event.target.value)}
                    >
                        <option value='page'>page</option>
                        <option value='post'>post</option>
                    </select>
                </div>
            </div>

            <div className='mb-3'>
                <label className='form-label' htmlFor='description'>
                    Description
                </label>
                <textarea
                    id='description'
                    className='form-control'
                    rows={3}
                    value={values.description}
                    onChange={(event) => set('description', event.target.value)}
                    required
                />
            </div>

            <div className='row'>
                <div className='col-md-6 mb-3'>
                    <label className='form-label' htmlFor='category'>
                        Category
                    </label>
                    <select
                        id='category'
                        className='form-select'
                        value={values.categoryId ?? ''}
                        onChange={(event) => set('categoryId', event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value=''>—</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='col-md-6 mb-3'>
                    <label className='form-label' htmlFor='tags'>
                        Tags
                    </label>
                    <input
                        id='tags'
                        className='form-control'
                        value={values.tagsText}
                        onChange={(event) => set('tagsText', event.target.value)}
                        placeholder='comma, separated'
                    />
                    <div className='form-text'>Tags that do not exist yet are created on save.</div>
                </div>
            </div>

            <details className='mb-3'>
                <summary className='mb-2'>SEO</summary>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='seoTitle'>
                        SEO title
                    </label>
                    <input
                        id='seoTitle'
                        className='form-control'
                        value={values.seoTitle ?? ''}
                        onChange={(event) => set('seoTitle', event.target.value)}
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='seoDescription'>
                        SEO description
                    </label>
                    <input
                        id='seoDescription'
                        className='form-control'
                        value={values.seoDescription ?? ''}
                        onChange={(event) => set('seoDescription', event.target.value)}
                    />
                </div>
            </details>

            <div className='form-check mb-4'>
                <input
                    id='published'
                    className='form-check-input'
                    type='checkbox'
                    checked={values.published ?? false}
                    onChange={(event) => set('published', event.target.checked)}
                />
                <label className='form-check-label' htmlFor='published'>
                    Published — unpublished content is hidden from anonymous visitors
                </label>
            </div>

            <button className='btn btn-primary' type='submit' disabled={submitting}>
                {submitting ? 'Saving…' : submitLabel}
            </button>
        </form>
    );
};
//
export default ContentForm;
//
