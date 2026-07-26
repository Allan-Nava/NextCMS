/*
 * File: forgot-password.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useState } from 'react';
import type { NextPage } from 'next';
import { forgotPassword } from '../lib/crud/AuthCRUD';
//
// Request a password reset link (NC-39).
//
// The confirmation is deliberately the same whether or not the address exists,
// matching the API: saying "no such account" would leak who has one.
const ForgotPassword: NextPage = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        forgotPassword(email)
            .then(() => setSent(true))
            .catch((err) => setError(String(err?.response?.data?.error ?? 'Something went wrong. Please try again.')));
    };

    return (
        <div className='container py-5' style={{ maxWidth: '28rem' }}>
            <h1 className='h3 mb-4'>Forgot your password?</h1>
            {sent ? (
                <div className='alert alert-success'>
                    If that address belongs to an account, a reset link is on its way.
                </div>
            ) : (
                <form onSubmit={onSubmit}>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='email'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            className='form-control'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <button className='btn btn-primary' type='submit'>
                        Send reset link
                    </button>
                </form>
            )}
        </div>
    );
};
//
export default ForgotPassword;
//
