/*
 * File: validation.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Input validation for the API routes (NC-8). The handlers used to pass request
// bodies straight to Prisma, so a missing field surfaced as a 500 from the
// database driver instead of a 400.
//
import { isRegisteredComponent } from '../../components/registry';
//
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//
export const MIN_PASSWORD_LENGTH = 10;
//
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
//
export function isEmail(value: unknown): value is string {
    return typeof value === 'string' && EMAIL_PATTERN.test(value);
}
//
export function isSlug(value: unknown): value is string {
    return typeof value === 'string' && /^\/[A-Za-z0-9\-_/]*$/.test(value);
}
//
// Returns the list of problems found, empty when the payload is acceptable.
export function validateUserPayload(body: unknown, options: { requirePassword: boolean }): string[] {
    const errors: string[] = [];
    const payload = (body ?? {}) as Record<string, unknown>;
    if (!isNonEmptyString(payload.username)) errors.push('username is required');
    if (!isEmail(payload.email)) errors.push('a valid email is required');
    if (!isNonEmptyString(payload.firstName)) errors.push('firstName is required');
    if (!isNonEmptyString(payload.lastName)) errors.push('lastName is required');
    if (options.requirePassword || payload.password !== undefined) {
        if (!isNonEmptyString(payload.password) || (payload.password as string).length < MIN_PASSWORD_LENGTH) {
            errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        }
    }
    return errors;
}
//
export function validatePagePayload(body: unknown): string[] {
    const errors: string[] = [];
    const payload = (body ?? {}) as Record<string, unknown>;
    if (!isNonEmptyString(payload.title)) errors.push('title is required');
    if (!isNonEmptyString(payload.description)) errors.push('description is required');
    if (!isSlug(payload.slug)) errors.push('slug is required and must start with "/"');
    if (payload.type !== undefined && !isNonEmptyString(payload.type)) errors.push('type must be a non-empty string');
    return errors;
}
//
export function validateComponentPayload(body: unknown): string[] {
    const errors: string[] = [];
    const payload = (body ?? {}) as Record<string, unknown>;
    if (!isNonEmptyString(payload.name)) errors.push('name is required');
    if (!isNonEmptyString(payload.path)) errors.push('path is required');
    return errors;
}
//
// A saved layout is a list of blocks (NC-42). Every path is checked against the
// component registry here, so a layout the renderer could not draw never reaches
// the database (NC-34).
export function validateLayoutPayload(body: unknown): string[] {
    const errors: string[] = [];
    const payload = (body ?? {}) as Record<string, unknown>;
    const blocks = payload.components;
    if (!Array.isArray(blocks)) {
        return ['components must be an array'];
    }
    blocks.forEach((block, index) => {
        const item = (block ?? {}) as Record<string, unknown>;
        if (!isNonEmptyString(item.name)) errors.push(`components[${index}].name is required`);
        if (!isNonEmptyString(item.path)) {
            errors.push(`components[${index}].path is required`);
        } else if (!isRegisteredComponent(item.path)) {
            errors.push(`components[${index}].path "${item.path}" is not a registered component`);
        }
        if (item.props !== undefined && (typeof item.props !== 'object' || item.props === null || Array.isArray(item.props))) {
            errors.push(`components[${index}].props must be an object`);
        }
    });
    return errors;
}
//
export function validateTaxonomyPayload(body: unknown): string[] {
    const errors: string[] = [];
    const payload = (body ?? {}) as Record<string, unknown>;
    if (!isNonEmptyString(payload.name)) errors.push('name is required');
    if (payload.slug !== undefined && !isNonEmptyString(payload.slug)) errors.push('slug must be a non-empty string');
    return errors;
}
//
