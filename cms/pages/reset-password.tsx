/*
 * File: reset-password.tsx
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
import { resetPassword } from '../lib/crud/AuthCRUD';
//
// Redeem a reset token (NC-39). The token arrives in the query string, from the
// link built by lib/helpers/mailer.ts.
const MIN_PASSWORD_LENGTH = 10;
//
const ResetPassword: NextPage = () => {
    const router = useRouter();
    const token = typeof router.query.token === 'string' ? router.query.token : '';
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        if (password !== confirmation) {
            setError('The two passwords do not match.');
            return;
        }
        resetPassword(token, password)
            .then(() => setDone(true))
            .catch((err) => setError(String(err?.response?.data?.error ?? 'Could not reset your password.')));
    };

    if (!token) {
        return (
            <div className='container py-5' style={{ maxWidth: '28rem' }}>
                <div className='alert alert-danger'>This link is missing its token.</div>
                <Link href='/forgot-password'>Request a new one</Link>
            </div>
        );
    }

    return (
        <div className='container py-5' style={{ maxWidth: '28rem' }}>
            <h1 className='h3 mb-4'>Choose a new password</h1>
            {done ? (
                <div className='alert alert-success'>
                    Your password has been updated. <Link href='/login'>Sign in</Link>
                </div>
            ) : (
                <form onSubmit={onSubmit}>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='password'>
                            New password
                        </label>
                        <input
                            id='password'
                            type='password'
                            className='form-control'
                            minLength={MIN_PASSWORD_LENGTH}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete='new-password'
                            required
                        />
                        <div className='form-text'>At least {MIN_PASSWORD_LENGTH} characters.</div>
                    </div>
                    <div className='mb-4'>
                        <label className='form-label' htmlFor='confirmation'>
                            Repeat it
                        </label>
                        <input
                            id='confirmation'
                            type='password'
                            className='form-control'
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            autoComplete='new-password'
                            required
                        />
                    </div>
                    <button className='btn btn-primary' type='submit'>
                        Update password
                    </button>
                </form>
            )}
        </div>
    );
};
//
export default ResetPassword;
//
