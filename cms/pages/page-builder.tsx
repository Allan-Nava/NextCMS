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
import type { GetServerSideProps, NextPage } from 'next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LayoutZone from '../components/pagebuilder/LayoutZone';
import Sidebar from '../components/pagebuilder/Sidebar';
import { PageComponent } from '../lib/types/page';
import { componentRepo } from '../lib/helpers/component-repo';
//
// The authoring screen. `pages/pagebuilder.tsx` was a near-identical older copy
// of this file and has been removed (NC-35); this is the path the middleware
// guards.
//
interface PageBuilderProps {
    availableComponents: PageComponent[];
}
//
const PageBuilder: NextPage<PageBuilderProps> = ({ availableComponents }) => {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className='container-fluid'>
                <div className='row overflow-hidden'>
                    <div className='col-3'>
                        <div className='row vh-100 overflow-auto'>
                            <Sidebar components={availableComponents} />
                        </div>
                    </div>
                    <div className='col-9'>
                        <LayoutZone />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};
//
export const getServerSideProps: GetServerSideProps<PageBuilderProps> = async () => {
    // Descriptor parsing (and its failure mode) lives in the repo layer, so the
    // page no longer hand-rolls a try/catch around JSON.parse.
    const components = await componentRepo.getAll();
    return {
        props: {
            availableComponents: components.map(componentRepo.toPageComponent),
        },
    };
};
//
export default PageBuilder;
//
