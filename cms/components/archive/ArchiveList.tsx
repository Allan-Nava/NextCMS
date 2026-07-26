/*
 * File: ArchiveList.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React from 'react';
import Link from 'next/link';
import type { Archive } from '../../lib/helpers/archive';
import Seo from '../Seo';
//
// One presentation for every archive (NC-80), so the three routes cannot drift.
const ArchiveList: React.FC<{ archive: Archive; basePath: string }> = ({ archive, basePath }) => {
    const { meta } = archive;
    return (
        <>
            <Seo seo={archive.seo} />
            <div className='container py-5' style={{ maxWidth: '48rem' }}>
                <h1 className='h3 mb-1'>{archive.heading}</h1>
                <p className='text-muted'>
                    {meta.total} item{meta.total === 1 ? '' : 's'}
                </p>

                {archive.items.length === 0 ? (
                    <p className='text-muted'>Nothing published here yet.</p>
                ) : (
                    <ul className='list-unstyled'>
                        {archive.items.map((item) => (
                            <li key={item.slug} className='border-bottom py-3'>
                                <h2 className='h5 mb-1'>
                                    <Link href={item.slug}>
                                        <a>{item.title}</a>
                                    </Link>
                                </h2>
                                <p className='mb-1'>{item.description}</p>
                                <p className='text-muted small mb-0'>
                                    {item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 10) : null}
                                    {item.author ? ` · ${item.author}` : null}
                                    {item.category ? (
                                        <>
                                            {' · '}
                                            <Link href={`/category/${item.category.slug}`}>
                                                <a>{item.category.name}</a>
                                            </Link>
                                        </>
                                    ) : null}
                                </p>
                                {item.tags.length > 0 && (
                                    <p className='small mb-0'>
                                        {item.tags.map((tag) => (
                                            <Link href={`/tag/${tag.slug}`} key={tag.slug}>
                                                <a className='me-2'>#{tag.name}</a>
                                            </Link>
                                        ))}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {meta.totalPages > 1 && (
                    <nav className='d-flex justify-content-between mt-4' aria-label='Pagination'>
                        {meta.page > 1 ? (
                            <Link href={`${basePath}?page=${meta.page - 1}`}>
                                <a className='btn btn-outline-secondary btn-sm'>← Newer</a>
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span className='text-muted small align-self-center'>
                            Page {meta.page} of {meta.totalPages}
                        </span>
                        {meta.hasMore ? (
                            <Link href={`${basePath}?page=${meta.page + 1}`}>
                                <a className='btn btn-outline-secondary btn-sm'>Older →</a>
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                )}
            </div>
        </>
    );
};
//
export default ArchiveList;
//
