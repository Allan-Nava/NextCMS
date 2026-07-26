/*
 * File: NamedList.tsx
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React, { useCallback, useEffect, useState } from 'react';
import EntityTable from './EntityTable';
import { ApiError, Paged } from '../../../lib/crud/AdminAPI';
//
// Roles, categories and tags are the same screen three times over: a list of
// things with a name, a create box and a delete button (NC-43). The differences
// live in the four callbacks.
export interface NamedEntity {
    id: number;
    name: string;
    slug?: string;
}
//
const NamedList: React.FC<{
    heading: string;
    list: () => Promise<Paged<NamedEntity>>;
    create: (name: string) => Promise<unknown>;
    remove: (id: number) => Promise<unknown>;
    showSlug?: boolean;
    hint?: string;
}> = ({ heading, list, create, remove, showSlug, hint }) => {
    const [rows, setRows] = useState<NamedEntity[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        setError(null);
        list()
            .then(({ rows: fetched }) => setRows(fetched))
            .catch((err: ApiError) =>
                setError(err.status === 403 ? 'Only an administrator can manage these.' : err.message)
            );
    }, [list]);

    useEffect(load, [load]);

    const onCreate = (event: React.FormEvent) => {
        event.preventDefault();
        if (name.trim().length === 0) return;
        setSaving(true);
        create(name)
            .then(() => {
                setName('');
                setSaving(false);
                load();
            })
            .catch((err: ApiError) => {
                setSaving(false);
                setError(err.message);
            });
    };

    return (
        <section className='mb-5'>
            <h2 className='h6 mb-3'>{heading}</h2>
            <EntityTable
                rows={rows}
                error={error}
                empty='None yet.'
                columns={[
                    { header: 'Name', render: (row) => row.name },
                    ...(showSlug ? [{ header: 'Slug', render: (row: NamedEntity) => <code>{row.slug}</code> }] : []),
                    {
                        header: 'Actions',
                        align: 'end' as const,
                        render: (row: NamedEntity) => (
                            <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => {
                                    if (!window.confirm(`Delete “${row.name}”?`)) return;
                                    remove(row.id)
                                        .then(load)
                                        .catch((err: ApiError) => setError(err.message));
                                }}
                            >
                                Delete
                            </button>
                        ),
                    },
                ]}
            />
            <form onSubmit={onCreate} className='d-flex gap-2' style={{ maxWidth: '28rem' }}>
                <input
                    className='form-control form-control-sm'
                    placeholder='Name'
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-label={`New ${heading}`}
                />
                <button className='btn btn-primary btn-sm text-nowrap' type='submit' disabled={saving}>
                    {saving ? 'Adding…' : 'Add'}
                </button>
            </form>
            {hint && <p className='text-muted small mt-2 mb-0'>{hint}</p>}
        </section>
    );
};
//
export default NamedList;
//
