/*
 * File: component-repo.ts
 * Project: next-cms
 * File Created: Saturday, 23rd April 2022 12:30:05 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import prisma from '../prisma';
import { Prisma, Component } from '@prisma/client';
import { PageComponent } from '../types/page';
import { logger } from '../utils/logger';
//
export interface CreateComponentInput {
    name: string;
    path: string;
    parent?: number;
    props?: Record<string, unknown>;
    supportNestedComponent?: boolean;
}
//
export type UpdateComponentInput = Partial<CreateComponentInput>;
//
export const componentRepo = {
    getAll,
    getById,
    getForPage,
    replaceForPage,
    create,
    update,
    delete: _delete,
    toPageComponent,
};
//
async function getAll(): Promise<Component[]> {
    return prisma.component.findMany({ where: { deletedAt: null }, orderBy: [{ parent: 'asc' }, { position: 'asc' }] });
}
//
// The blocks of one page, in layout order (NC-42).
async function getForPage(pageId: number): Promise<Component[]> {
    return prisma.component.findMany({
        where: { parent: pageId, deletedAt: null },
        orderBy: { position: 'asc' },
    });
}
//
// Persists a page's layout (NC-42). The page builder holds an ordered list, so
// the write is a replacement rather than a diff: the previous blocks are
// soft-deleted and the new ones inserted with their position.
//
// Wrapped in a transaction — a layout half-replaced is worse than one not saved,
// because the page would render a mix of the old and new versions.
// The array form of `$transaction` rather than the callback form: interactive
// transactions are still a preview feature in Prisma 3, and this does not need
// one — the operations are known up front and run in order.
async function replaceForPage(pageId: number, blocks: CreateComponentInput[]): Promise<Component[]> {
    const retire = prisma.component.updateMany({
        where: { parent: pageId, deletedAt: null },
        data: { deletedAt: new Date() },
    });
    const inserts = blocks.map((block, position) => {
        const descriptor = describe({ ...block, parent: pageId });
        return prisma.component.create({
            data: {
                name: block.name,
                property: JSON.stringify(descriptor),
                parent: pageId,
                position,
                template: block.path,
                data: JSON.stringify(descriptor.props),
            },
        });
    });
    const result = await prisma.$transaction([retire, ...inserts]);
    // The first entry is the updateMany count; the rest are the created rows.
    const created = result.slice(1) as Component[];
    logger.info('page layout replaced', { pageId, blocks: created.length });
    return created;
}
//
async function getById(id: number): Promise<Component | null> {
    return prisma.component.findUnique({ where: { id } });
}
//
// `property` holds the serialised PageComponent, `template` the module path and
// `data` its props. All three are mandatory in the schema; `property` used to be
// written with `toString()`, which stored the literal "[object Object]" (NC-21,
// NC-25).
function describe(input: CreateComponentInput): PageComponent {
    return {
        name: input.name,
        path: input.path,
        props: input.props ?? {},
        components: [],
        supportNestedComponent: input.supportNestedComponent ?? false,
    };
}
//
async function create(input: CreateComponentInput): Promise<Component> {
    const descriptor = describe(input);
    const data: Prisma.ComponentCreateInput = {
        name: input.name,
        property: JSON.stringify(descriptor),
        parent: input.parent ?? 0,
        template: input.path,
        data: JSON.stringify(descriptor.props),
    };
    const component = await prisma.component.create({ data });
    logger.info('component created', { id: component.id, name: component.name });
    return component;
}
//
async function update(id: number, patch: UpdateComponentInput): Promise<Component> {
    const current = await prisma.component.findUnique({ where: { id } });
    if (!current) {
        // Surfaces as Prisma's P2025 to the caller, like every other miss.
        throw new Prisma.PrismaClientKnownRequestError('component not found', 'P2025', Prisma.prismaVersion.client);
    }
    const descriptor = describe({
        name: patch.name ?? current.name,
        path: patch.path ?? current.template,
        props: patch.props,
        supportNestedComponent: patch.supportNestedComponent,
    });
    const data: Prisma.ComponentUpdateInput = {
        name: descriptor.name,
        property: JSON.stringify(descriptor),
        template: descriptor.path,
        data: JSON.stringify(descriptor.props),
        updatedAt: new Date(),
    };
    if (patch.parent !== undefined) data.parent = patch.parent;
    const component = await prisma.component.update({ where: { id }, data });
    logger.info('component updated', { id: component.id });
    return component;
}
//
// Soft delete, consistent with pages.
async function _delete(id: number): Promise<Component> {
    const component = await prisma.component.update({ where: { id }, data: { deletedAt: new Date() } });
    logger.info('component soft-deleted', { id });
    return component;
}
//
// Rehydrates the stored descriptor for the renderer. Malformed rows degrade to a
// minimal descriptor instead of throwing during a page render.
function toPageComponent(component: Component): PageComponent {
    try {
        const parsed = JSON.parse(component.property) as PageComponent;
        if (parsed && typeof parsed.path === 'string') return parsed;
    } catch (error) {
        logger.warn('component descriptor is not valid JSON', { id: component.id });
    }
    return {
        name: component.name,
        path: component.template,
        props: {},
        components: [],
        supportNestedComponent: false,
    };
}
//
