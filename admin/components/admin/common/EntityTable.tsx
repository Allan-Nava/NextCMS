/*
 * File: EntityTable.tsx
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React from 'react';
//
// One table for every entity screen (NC-43), so five screens do not each invent
// their own empty state, loading state and error banner.
export interface Column<T> {
    header: string;
    render: (row: T) => React.ReactNode;
    align?: 'start' | 'end';
}
//
function EntityTable<T extends { id: number }>({
    rows,
    columns,
    loading,
    error,
    empty,
}: {
    rows: T[] | null;
    columns: Column<T>[];
    loading?: boolean;
    error?: string | null;
    empty?: string;
}): JSX.Element {
    if (error) return <div className='alert alert-danger'>{error}</div>;
    if (loading || rows === null) return <p className='text-muted'>Loading…</p>;
    if (rows.length === 0) return <p className='text-muted'>{empty ?? 'Nothing here yet.'}</p>;
    return (
        <div className='table-responsive'>
            <table className='table align-middle'>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.header} className={column.align === 'end' ? 'text-end' : undefined}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            {columns.map((column) => (
                                <td key={column.header} className={column.align === 'end' ? 'text-end' : undefined}>
                                    {column.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
//
export default EntityTable;
//
