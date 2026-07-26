/*
 * File: layout.tsx
 * Project: next-admin
 * File Created: Wednesday, 20th April 2022 7:29:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AdminUser, ApiError, session } from '../../../lib/crud/AdminAPI';
//
// The panel shell (NC-43): sidebar, signed-in user, and one place that notices the
// session has gone. It replaces the previous navbar/sidebar pair, which rendered
// nothing usable.
//
// The middleware only checks that a cookie exists. This calls `auth/me`, which is
// the first real answer from the API about who — if anyone — is signed in.
const NAV = [
    { href: '/', label: 'Dashboard' },
    { href: '/content', label: 'Content' },
    { href: '/users', label: 'Users' },
    { href: '/roles', label: 'Roles' },
    { href: '/taxonomies', label: 'Categories & tags' },
];
//
const Layout: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => {
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [sessionError, setSessionError] = useState<string | null>(null);

    useEffect(() => {
        session
            .me()
            .then(setUser)
            .catch((error: ApiError) => {
                setSessionError(
                    error.status === 401
                        ? 'Your session has expired. Sign in again to continue.'
                        : 'Could not read your session.'
                );
            });
    }, []);

    return (
        <div className='d-flex min-vh-100'>
            <aside className='border-end bg-light p-3' style={{ width: '15rem', flex: '0 0 15rem' }}>
                <p className='fw-bold mb-1'>NextCMS</p>
                <p className='text-muted small mb-4'>Admin panel</p>
                <nav>
                    <ul className='list-unstyled mb-4'>
                        {NAV.map((item) => {
                            const active = router.pathname === item.href;
                            return (
                                <li key={item.href} className='mb-1'>
                                    <Link href={item.href}>
                                        <a
                                            className={`d-block px-2 py-1 rounded text-decoration-none ${
                                                active ? 'bg-primary text-white' : 'text-dark'
                                            }`}
                                        >
                                            {item.label}
                                        </a>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className='small text-muted'>
                    {user ? (
                        <>
                            Signed in as <strong>{user.username}</strong>
                            {user.isAdmin ? <span className='badge bg-secondary ms-1'>admin</span> : null}
                        </>
                    ) : (
                        '…'
                    )}
                </div>
            </aside>
            <main className='flex-grow-1 p-4' style={{ minWidth: 0 }}>
                <h1 className='h4 mb-4'>{title}</h1>
                {sessionError && <div className='alert alert-warning'>{sessionError}</div>}
                {children}
            </main>
        </div>
    );
};
//
export default Layout;
//
