/*
 * File: AdminAPI.ts
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// The panel's only way of talking to the cms API (NC-44).
//
// Every call goes to a same-origin `/admin/api/...` path that next.config.js
// proxies, so the HttpOnly cookie is attached by the browser and this file never
// handles a token. It also means a 401 here means "the session is gone" and a 403
// means "this account is not an admin" — both worth showing differently.
//
import { QueryValue, apiPath } from '../utils/session';
//
export interface ApiEnvelope<T> {
    response: string;
    message?: string;
    data: T;
    error?: unknown;
}
//
export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}
//
async function request<T>(method: string, resource: string, body?: unknown, query?: Record<string, QueryValue>): Promise<T> {
    const response = await fetch(apiPath(resource, query ?? {}), {
        method,
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        // The cookie is same-origin, but being explicit keeps this correct if the
        // proxy is ever dropped in favour of a direct call.
        credentials: 'same-origin',
    });
    if (!response.ok) {
        // The API answers `{response:"KO", error:{error:"..."}}`; fall back to the
        // status text when a proxy or a crash returns something else.
        let message = response.statusText;
        try {
            const payload = (await response.json()) as ApiEnvelope<unknown>;
            const detail = (payload.error as { error?: string } | undefined)?.error;
            if (detail) message = detail;
        } catch {
            // Not JSON — keep the status text.
        }
        throw new ApiError(response.status, message);
    }
    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
}
//
export const api = {
    get: <T>(resource: string, query?: Record<string, QueryValue>) => request<T>('GET', resource, undefined, query),
    post: <T>(resource: string, body: unknown) => request<T>('POST', resource, body),
    patch: <T>(resource: string, body: unknown) => request<T>('PATCH', resource, body),
    put: <T>(resource: string, body: unknown) => request<T>('PUT', resource, body),
    delete: <T>(resource: string) => request<T>('DELETE', resource),
};
//
// ---------------------------------------------------------------- entities ---
//
export interface AdminUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isStaff: boolean;
    updatedAt: string;
}
//
export interface Taxonomy {
    id: number;
    name: string;
    slug: string;
}
//
export interface Role {
    id: number;
    name: string;
}
//
export interface ContentSummary {
    id: number;
    title: string;
    slug: string;
    type: string;
    publishedAt: string | null;
    category: Taxonomy | null;
    tags: Taxonomy[];
}
//
export const users = {
    list: () => api.get<AdminUser[]>('user'),
    create: (input: Record<string, unknown>) => api.post<AdminUser>('user', input),
    update: (id: number, input: Record<string, unknown>) => api.patch<AdminUser>(`user/${id}`, input),
    remove: (id: number) => api.delete<{ id: number }>(`user/${id}`),
};
//
export const roles = {
    list: () => api.get<Role[]>('role'),
    create: (name: string) => api.post<Role>('role', { name }),
    update: (id: number, name: string) => api.patch<Role>(`role/${id}`, { name }),
    remove: (id: number) => api.delete<{ id: number }>(`role/${id}`),
};
//
export const categories = {
    list: () => api.get<Taxonomy[]>('category'),
    create: (name: string) => api.post<Taxonomy>('category', { name }),
    remove: (id: number) => api.delete<{ id: number }>(`category/${id}`),
};
//
export const tags = {
    list: () => api.get<Taxonomy[]>('tag'),
    create: (name: string) => api.post<Taxonomy>('tag', { name }),
    remove: (id: number) => api.delete<{ id: number }>(`tag/${id}`),
};
//
export const content = {
    list: (type?: string) => api.get<ContentSummary[]>('page', { type }),
};
//
export const session = {
    me: () => api.get<AdminUser>('auth/me'),
};
//
