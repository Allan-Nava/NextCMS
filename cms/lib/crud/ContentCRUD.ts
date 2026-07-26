/*
 * File: ContentCRUD.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Client calls for content, taxonomies and layouts (NC-41, NC-42). The
// access-token cookie is HttpOnly, so the browser attaches it by itself on these
// same-origin requests.
//
import axios from 'axios';
import type { ApiEnvelope } from './AuthCRUD';
import type { PageComponent } from '../types/page';
//
export interface PagedEnvelope<T> extends ApiEnvelope<T[]> {
    meta: { page: number; perPage: number; total: number; totalPages: number; hasMore: boolean };
}
//
export interface Author {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
}
//
export interface ContentSummary {
    id: number;
    title: string;
    slug: string;
    description: string;
    type: string;
    publishedAt: string | null;
    category: { id: number; name: string; slug: string } | null;
    tags: { id: number; name: string; slug: string }[];
    author: Author | null;
}
//
export interface Taxonomy {
    id: number;
    name: string;
    slug: string;
}
//
export interface ContentPayload {
    title: string;
    slug: string;
    description: string;
    type: string;
    seoTitle?: string;
    seoDescription?: string;
    categoryId?: number | null;
    tagNames?: string[];
    published?: boolean;
}
//
export function listContent(type?: string, options: { page?: number; perPage?: number; mine?: boolean } = {}) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (options.page) params.set('page', String(options.page));
    if (options.perPage) params.set('perPage', String(options.perPage));
    if (options.mine) params.set('author', 'me');
    const query = params.toString();
    return axios.get<PagedEnvelope<ContentSummary>>(`/api/page${query ? `?${query}` : ''}`);
}
//
export function getContent(id: number) {
    return axios.get<ApiEnvelope<ContentSummary>>(`/api/page/${id}`);
}
//
export function createContent(payload: ContentPayload) {
    return axios.post<ApiEnvelope<ContentSummary>>('/api/page', payload);
}
//
export function updateContent(id: number, payload: Partial<ContentPayload>) {
    return axios.patch<ApiEnvelope<ContentSummary>>(`/api/page/${id}`, payload);
}
//
export function deleteContent(id: number) {
    return axios.delete<ApiEnvelope<{ id: number }>>(`/api/page/${id}`);
}
//
export function listCategories() {
    return axios.get<PagedEnvelope<Taxonomy>>('/api/category?perPage=100');
}
//
export function listTags() {
    return axios.get<PagedEnvelope<Taxonomy>>('/api/tag?perPage=100');
}
//
export function getLayout(pageId: number) {
    return axios.get<ApiEnvelope<PageComponent[]>>(`/api/page/${pageId}/layout`);
}
//
export function saveLayout(pageId: number, components: PageComponent[]) {
    return axios.put<ApiEnvelope<PageComponent[]>>(`/api/page/${pageId}/layout`, { components });
}
//
