/*
 * File: index.tsx
 * Project: next-admin
 * File Created: Sunday, 27th March 2022 10:42:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/admin/common/layout';
import { categories, content, roles, tags, users } from '../lib/crud/AdminAPI';
//
// Dashboard (NC-43). It replaced a page whose entire body was the string
// "TODO ADMIN STUFF".
//
// The counts come from the list endpoints rather than a dedicated stats route:
// five small requests are cheaper than an endpoint that has to be kept in sync
// with what the panel happens to show.
interface Counts {
    content: number | null;
    users: number | null;
    roles: number | null;
    categories: number | null;
    tags: number | null;
}
//
const CARDS: { key: keyof Counts; label: string; href: string }[] = [
    { key: 'content', label: 'Content items', href: '/content' },
    { key: 'users', label: 'Users', href: '/users' },
    { key: 'roles', label: 'Roles', href: '/roles' },
    { key: 'categories', label: 'Categories', href: '/taxonomies' },
    { key: 'tags', label: 'Tags', href: '/taxonomies' },
];
//
const Dashboard: NextPage = () => {
    const [counts, setCounts] = useState<Counts>({
        content: null,
        users: null,
        roles: null,
        categories: null,
        tags: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Each count settles on its own: a 403 on the admin-only endpoints must not
        // blank out the counts a non-admin is allowed to see.
        const load = <K extends keyof Counts>(key: K, promise: Promise<{ length: number }>) =>
            promise
                .then((rows) => setCounts((current) => ({ ...current, [key]: rows.length })))
                .catch(() => setCounts((current) => ({ ...current, [key]: -1 })));
        Promise.all([
            load('content', content.list()),
            load('users', users.list()),
            load('roles', roles.list()),
            load('categories', categories.list()),
            load('tags', tags.list()),
        ]).catch(() => setError('Could not load the dashboard.'));
    }, []);

    return (
        <Layout title='Dashboard'>
            {error && <div className='alert alert-danger'>{error}</div>}
            <div className='row g-3'>
                {CARDS.map((card) => {
                    const value = counts[card.key];
                    return (
                        <div className='col-6 col-lg-4' key={card.label}>
                            <Link href={card.href}>
                                <a className='text-decoration-none'>
                                    <div className='card h-100'>
                                        <div className='card-body'>
                                            <p className='text-muted small mb-1'>{card.label}</p>
                                            <p className='h3 mb-0'>
                                                {value === null ? '…' : value === -1 ? '—' : value}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    );
                })}
            </div>
            <p className='text-muted small mt-4'>
                A dash means the API refused the request — usually because this account is not an administrator.
            </p>
        </Layout>
    );
};
//
export default Dashboard;
//
