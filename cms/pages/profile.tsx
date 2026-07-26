/*
 * File: profile.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { currentUser, updateProfile } from '../lib/crud/AuthCRUD';
import { PublicUser } from '../lib/types/user';
//
// Profile screen (NC-40): read and update your own account.
//
// The page is a client component on purpose — it reads the session through
// /api/auth/me, which is also what the admin app will do once it grows a UI.
// The middleware keeps logged-out visitors away from this path.
const Profile: NextPage = () => {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' });
    const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'ok' | 'error'; message?: string }>({
        kind: 'idle',
    });

    useEffect(() => {
        currentUser()
            .then(({ data }) => {
                setUser(data.data);
                setForm({
                    email: data.data.email,
                    firstName: data.data.firstName,
                    lastName: data.data.lastName,
                    password: '',
                });
            })
            .catch(() => setStatus({ kind: 'error', message: 'Could not load your profile. Please sign in again.' }));
    }, []);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!user) return;
        setStatus({ kind: 'saving' });
        // An empty password field means "leave it alone" — the API validates it
        // only when present.
        const patch: Record<string, unknown> = {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
        };
        if (form.password.length > 0) patch.password = form.password;
        updateProfile(user.id, patch)
            .then(({ data }) => {
                setUser(data.data);
                setForm((current) => ({ ...current, password: '' }));
                setStatus({ kind: 'ok', message: 'Profile updated.' });
            })
            .catch((error) => {
                const message = error?.response?.data?.error ?? 'Could not save your changes.';
                setStatus({ kind: 'error', message: String(message) });
            });
    };

    if (!user) {
        return (
            <div className='container py-5'>
                {status.kind === 'error' ? (
                    <div className='alert alert-danger'>{status.message}</div>
                ) : (
                    <p>Loading your profile…</p>
                )}
            </div>
        );
    }

    return (
        <div className='container py-5' style={{ maxWidth: '32rem' }}>
            <h1 className='h3 mb-4'>Your profile</h1>
            <p className='text-muted'>
                Signed in as <strong>{user.username}</strong>
                {user.isAdmin ? ' (administrator)' : null}
            </p>
            {status.kind === 'ok' && <div className='alert alert-success'>{status.message}</div>}
            {status.kind === 'error' && <div className='alert alert-danger'>{status.message}</div>}
            <form onSubmit={onSubmit}>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='email'>
                        Email
                    </label>
                    <input
                        id='email'
                        type='email'
                        className='form-control'
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        required
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='firstName'>
                        First name
                    </label>
                    <input
                        id='firstName'
                        className='form-control'
                        value={form.firstName}
                        onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                        required
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='lastName'>
                        Last name
                    </label>
                    <input
                        id='lastName'
                        className='form-control'
                        value={form.lastName}
                        onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                        required
                    />
                </div>
                <div className='mb-4'>
                    <label className='form-label' htmlFor='password'>
                        New password
                    </label>
                    <input
                        id='password'
                        type='password'
                        className='form-control'
                        placeholder='Leave empty to keep your current password'
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        autoComplete='new-password'
                    />
                </div>
                <button className='btn btn-primary' type='submit' disabled={status.kind === 'saving'}>
                    {status.kind === 'saving' ? 'Saving…' : 'Save changes'}
                </button>
            </form>
        </div>
    );
};
//
export default Profile;
//
