/*
 * File: DynamicComponents.tsx
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React from 'react';
import { PageComponent } from '../lib/types/page';
import { resolveComponent } from './registry';
import NoComponent from './NoComponent';
//
// Renders a page description into React components.
//
// Components are resolved through the static registry (NC-34) instead of a
// runtime `import(path)` built from database data: webpack no longer has to
// bundle a require-context, and which module loads is decided by code, not by a
// row. An unknown path renders `NoComponent` rather than breaking the page.
//
const DynamicComponents: React.FC<{
    page?: PageComponent[];
    Wrapper?: React.FC<{ position: number; total: number }>;
}> = ({ page, Wrapper }) => {
    if (!page || page.length === 0) {
        return <></>;
    }
    return (
        <>
            {page.map((item, index) => {
                const Component = resolveComponent(item.path) ?? NoComponent;
                const children = item.supportNestedComponent ? <DynamicComponents page={item.components} /> : <></>;
                const rendered = (
                    <Component key={`component-${index}`} {...item.props} path={item.path}>
                        {children}
                    </Component>
                );
                if (!Wrapper) return rendered;
                return (
                    <Wrapper key={`wrapper-component-${index}`} position={index} total={page.length}>
                        {rendered}
                    </Wrapper>
                );
            })}
        </>
    );
};
//
export const DynamicComponent: React.FC<{ path: string }> = ({ children, path }) => {
    const Component = resolveComponent(path) ?? NoComponent;
    return <Component path={path}>{children}</Component>;
};
//
export default DynamicComponents;
//
