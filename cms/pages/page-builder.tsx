/*
 * File: page-builder.tsx
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:51:06 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LayoutZone from '../components/pagebuilder/LayoutZone';
import Sidebar from '../components/pagebuilder/Sidebar';
import { PageComponent } from '../lib/types/page';
import { registeredComponentPaths } from '../components/registry';
import { useAppDispatch, useAppSelector } from '../lib/hooks/dispatchHook';
import { selectLayout, setLayout } from '../lib/reducers/layout/reducer';
import { getLayout, saveLayout } from '../lib/crud/ContentCRUD';
import { parseId } from '../lib/utils/http';
//
// The authoring screen (NC-42).
//
// It used to be a sandbox: the palette came from whatever rows happened to be in
// the `Component` table, the layout lived in Redux and nothing was ever written
// down. Now it edits the layout of one page — `?page=<id>` — loading what was
// saved and writing it back through PUT /api/page/:id/layout.
//
interface PageBuilderProps {
    // The palette is the component registry, not the database: those are the
    // components the renderer can actually draw (NC-34).
    availableComponents: PageComponent[];
    pageId: number | null;
}
//
const PageBuilder: NextPage<PageBuilderProps> = ({ availableComponents, pageId }) => {
    const dispatch = useAppDispatch();
    const layout = useAppSelector(selectLayout);
    const [loading, setLoading] = useState(pageId !== null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });

    useEffect(() => {
        if (pageId === null) {
            // No page selected: start from an empty canvas rather than showing a
            // stale layout left in the store by a previous edit.
            dispatch(setLayout({ components: [] }));
            return;
        }
        getLayout(pageId)
            .then(({ data }) => {
                dispatch(setLayout({ components: data.data }));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setStatus({ kind: 'error', message: 'Could not load the saved layout.' });
            });
    }, [pageId, dispatch]);

    const onSave = () => {
        if (pageId === null) return;
        setSaving(true);
        setStatus({ kind: 'idle' });
        saveLayout(pageId, layout.components)
            .then(() => {
                setSaving(false);
                setStatus({ kind: 'ok', message: 'Layout saved.' });
            })
            .catch((error) => {
                setSaving(false);
                setStatus({ kind: 'error', message: String(error?.response?.data?.error ?? 'Could not save.') });
            });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='container-fluid'>
                <div className='d-flex justify-content-between align-items-center border-bottom py-2 px-3'>
                    <div>
                        <Link href='/content'>← Content</Link>
                        {pageId === null ? (
                            <span className='ms-3 text-danger'>
                                No page selected — open the builder from the content list to be able to save.
                            </span>
                        ) : (
                            <span className='ms-3 text-muted'>
                                Editing the layout of page #{pageId} — {layout.components.length} block
                                {layout.components.length === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>
                    <div className='d-flex align-items-center'>
                        {status.kind === 'ok' && <span className='text-success me-3'>{status.message}</span>}
                        {status.kind === 'error' && <span className='text-danger me-3'>{status.message}</span>}
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={onSave}
                            disabled={pageId === null || saving || loading}
                        >
                            {saving ? 'Saving…' : 'Save layout'}
                        </button>
                    </div>
                </div>
                <div className='row overflow-hidden'>
                    <div className='col-3'>
                        <div className='row vh-100 overflow-auto'>
                            <Sidebar components={availableComponents} />
                        </div>
                    </div>
                    <div className='col-9'>{loading ? <p className='p-3'>Loading layout…</p> : <LayoutZone />}</div>
                </div>
            </div>
        </DndProvider>
    );
};
//
export const getServerSideProps: GetServerSideProps<PageBuilderProps> = async (context) => {
    const availableComponents: PageComponent[] = registeredComponentPaths().map((path) => ({
        // The last segment of the path is a good enough label for the palette.
        name: path.split('/').pop() ?? path,
        path,
        props: {},
        components: [],
        supportNestedComponent: false,
    }));
    return {
        props: {
            availableComponents,
            pageId: parseId(context.query.page as string | string[] | undefined),
        },
    };
};
//
export default PageBuilder;
//
