/*
 * File: response.ts
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 11:00:15 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 26th April 2022 11:00:17 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

export enum DEFAULTResponse {
    OK = "OK",
    KO = "KO",
}
//
export interface SuccessResponse  {
    response: DEFAULTResponse;
    data: object;
    message: string;
}
//
export interface ErrorResponse  {
    response: DEFAULTResponse;
    error: object;
}
//
export function successResponse(data: object, message: string): SuccessResponse {
    return {
        data,
        message,
        response: DEFAULTResponse.OK
    }
}
//
export function errorResponse( error: object): ErrorResponse {
    return {
        error,
        response: DEFAULTResponse.KO
    }
}


//
// Paged responses (NC-78). `data` stays the array — a client that ignored
// pagination keeps working — and the totals sit beside it.
export interface PagedResponse<T> extends SuccessResponse {
    data: T[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}
//
export function pagedResponse<T>(
    data: T[],
    meta: PagedResponse<T>['meta'],
    message: string
): PagedResponse<T> {
    return { data, meta, message, response: DEFAULTResponse.OK };
}
