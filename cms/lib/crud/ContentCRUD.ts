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
export interface ContentSummary {
    id: number;
    title: string;
    slug: string;
    description: string;
    type: string;
    publishedAt: string | null;
    category: { id: number; name: string; slug: string } | null;
    tags: { id: number; name: string; slug: string }[];
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
export function listContent(type?: string) {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return axios.get<ApiEnvelope<ContentSummary[]>>(`/api/page${query}`);
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
    return axios.get<ApiEnvelope<Taxonomy[]>>('/api/category');
}
//
export function listTags() {
    return axios.get<ApiEnvelope<Taxonomy[]>>('/api/tag');
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
