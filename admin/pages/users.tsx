/*
 * File: users.tsx
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
import { AdminUser, ApiError, users } from '../lib/crud/AdminAPI';
//
// User management (NC-43). This is the only screen anywhere that can create a
// privileged account: `POST /api/user` is admin-only, and self-registration can
// never set the role flags.
const empty = { username: '', email: '', firstName: '', lastName: '', password: '', isAdmin: false, isStaff: false };
//
const UsersPage: NextPage = () => {
    const [rows, setRows] = useState<AdminUser[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        setError(null);
        users
            .list()
            .then(({ rows: fetched }) => setRows(fetched))
            .catch((err: ApiError) =>
                setError(
                    err.status === 403
                        ? 'Only an administrator can manage users.'
                        : `Could not load users: ${err.message}`
                )
            );
    }, []);

    useEffect(load, [load]);

    const onCreate = (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        users
            .create(form)
            .then(() => {
                setForm(empty);
                setSaving(false);
                load();
            })
            .catch((err: ApiError) => {
                setSaving(false);
                setError(err.message);
            });
    };

    const onDelete = (user: AdminUser) => {
        if (!window.confirm(`Delete ${user.username}? This cannot be undone.`)) return;
        users
            .remove(user.id)
            .then(load)
            .catch((err: ApiError) => setError(err.message));
    };

    const toggle = (user: AdminUser, field: 'isAdmin' | 'isStaff') => {
        users
            .update(user.id, {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                [field]: !user[field],
            })
            .then(load)
            .catch((err: ApiError) => setError(err.message));
    };

    return (
        <Layout title='Users'>
            <EntityTable
                rows={rows}
                error={error}
                empty='No users yet.'
                columns={[
                    { header: 'Username', render: (u) => u.username },
                    { header: 'Email', render: (u) => u.email },
                    { header: 'Name', render: (u) => `${u.firstName} ${u.lastName}`.trim() },
                    {
                        header: 'Admin',
                        render: (u) => (
                            <button
                                type='button'
                                className={`btn btn-sm ${u.isAdmin ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => toggle(u, 'isAdmin')}
                            >
                                {u.isAdmin ? 'yes' : 'no'}
                            </button>
                        ),
                    },
                    {
                        header: 'Staff',
                        render: (u) => (
                            <button
                                type='button'
                                className={`btn btn-sm ${u.isStaff ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => toggle(u, 'isStaff')}
                            >
                                {u.isStaff ? 'yes' : 'no'}
                            </button>
                        ),
                    },
                    {
                        header: 'Actions',
                        align: 'end',
                        render: (u) => (
                            <button type='button' className='btn btn-sm btn-outline-danger' onClick={() => onDelete(u)}>
                                Delete
                            </button>
                        ),
                    },
                ]}
            />

            <h2 className='h6 mt-4 mb-3'>Create a user</h2>
            <form onSubmit={onCreate} className='row g-2' style={{ maxWidth: '52rem' }}>
                {(
                    [
                        ['username', 'Username', 'text'],
                        ['email', 'Email', 'email'],
                        ['firstName', 'First name', 'text'],
                        ['lastName', 'Last name', 'text'],
                        ['password', 'Password (min 10 chars)', 'password'],
                    ] as const
                ).map(([field, label, type]) => (
                    <div className='col-md-4' key={field}>
                        <label className='form-label small' htmlFor={field}>
                            {label}
                        </label>
                        <input
                            id={field}
                            type={type}
                            className='form-control form-control-sm'
                            value={form[field]}
                            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                            required
                        />
                    </div>
                ))}
                <div className='col-12'>
                    <div className='form-check form-check-inline'>
                        <input
                            id='isAdmin'
                            className='form-check-input'
                            type='checkbox'
                            checked={form.isAdmin}
                            onChange={(event) => setForm({ ...form, isAdmin: event.target.checked })}
                        />
                        <label className='form-check-label small' htmlFor='isAdmin'>
                            Administrator
                        </label>
                    </div>
                    <div className='form-check form-check-inline'>
                        <input
                            id='isStaff'
                            className='form-check-input'
                            type='checkbox'
                            checked={form.isStaff}
                            onChange={(event) => setForm({ ...form, isStaff: event.target.checked })}
                        />
                        <label className='form-check-label small' htmlFor='isStaff'>
                            Staff
                        </label>
                    </div>
                </div>
                <div className='col-12'>
                    <button className='btn btn-primary btn-sm' type='submit' disabled={saving}>
                        {saving ? 'Creating…' : 'Create user'}
                    </button>
                </div>
            </form>
        </Layout>
    );
};
//
export default UsersPage;
//
