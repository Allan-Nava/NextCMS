/*
 * File: registry.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Allow-list of renderable components (NC-34).
//
// `DynamicComponents` used to do `import(`${item.path}`)` with a path coming
// straight from the database. Two problems: webpack has to bundle a whole
// require-context "just in case", and which module gets loaded is decided by
// data rather than by code. Every entry here is a literal import, so webpack
// resolves it statically and an unknown path simply has no match.
//
// Adding a component means adding one line here — that is the intended cost.
//
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
//
export const COMPONENT_REGISTRY: Record<string, ComponentType<any>> = {
    './Elements/Navbar': dynamic(() => import('./Elements/Navbar')),
    './Elements/Hero': dynamic(() => import('./Elements/Hero')),
    './Elements/Features': dynamic(() => import('./Elements/Features')),
    './Elements/Layout1': dynamic(() => import('./Elements/Layout1')),
};
//
export function registeredComponentPaths(): string[] {
    return Object.keys(COMPONENT_REGISTRY);
}
//
export function isRegisteredComponent(path: unknown): path is string {
    return typeof path === 'string' && Object.prototype.hasOwnProperty.call(COMPONENT_REGISTRY, path);
}
//
export function resolveComponent(path: string): ComponentType<any> | null {
    return isRegisteredComponent(path) ? COMPONENT_REGISTRY[path] : null;
}
//
