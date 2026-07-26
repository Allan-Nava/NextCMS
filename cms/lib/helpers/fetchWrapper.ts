/*
 * File: fetchWrapper.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 3:46:26 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Thin fetch wrapper used for server-to-server calls.
//
// `authHeader` used to be entirely commented out and always returned `{}`, so
// no request ever carried a token. It now forwards the access-token cookie of
// the incoming request when there is one (NC-6).
//
export interface RequestContext {
    req?: { cookies?: Record<string, string | undefined> };
    token?: string;
}
//
export const fetchWrapper = {
    get,
    post,
    put,
    delete: _delete,
};
//
async function get(url: string, context: RequestContext = {}): Promise<unknown> {
    return request('GET', url, undefined, context);
}
//
async function post(url: string, body: unknown, context: RequestContext = {}): Promise<unknown> {
    return request('POST', url, body, context);
}
//
async function put(url: string, body: unknown, context: RequestContext = {}): Promise<unknown> {
    return request('PUT', url, body, context);
}
//
async function _delete(url: string, context: RequestContext = {}): Promise<unknown> {
    return request('DELETE', url, undefined, context);
}
//
async function request(method: string, url: string, body: unknown, context: RequestContext): Promise<unknown> {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader(context) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return handleResponse(response);
}
//
function authHeader(context: RequestContext): Record<string, string> {
    const token = context.token ?? context.req?.cookies?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}
//
// Always resolves to the API envelope shape, so callers do not have to handle
// both a parsed body and a thrown error.
async function handleResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
        return { response: 'KO', error: await response.text(), data: null };
    }
    return response.json();
}
//
