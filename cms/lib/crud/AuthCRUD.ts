/*
 * File: AuthCRUD.ts
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 10:57:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { JWTModel, JWTModelToUserModel, PublicUser, UserModel } from '../types/user';
//
export const LOGIN_URL = '/api/auth/login';
export const LOGOUT_URL = '/api/auth/logout';
export const ME_URL = '/api/auth/me';
export const REFRESH_URL = '/api/auth/refresh';
export const FORGOT_PASSWORD_URL = '/api/auth/forgot-password';
export const RESET_PASSWORD_URL = '/api/auth/reset-password';
//
export interface LoginPayload {
    access_token: string;
    refresh_token: string;
    user: PublicUser;
}
//
export interface ApiEnvelope<T> {
    response: string;
    message: string;
    data: T;
}
//
// The previous implementation sent a FormData body while forcing
// `Content-Type: application/x-www-form-urlencoded`, so Next's body parser saw
// neither format and `req.body.username` was always undefined (NC-12). The API
// speaks JSON.
export function login(username: string, password: string) {
    return axios.post<ApiEnvelope<LoginPayload>>(
        LOGIN_URL,
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
    );
}
//
export function logout() {
    return axios.post(LOGOUT_URL);
}
//
// The access-token cookie is HttpOnly, so the browser attaches it on its own —
// no Authorization header needed for same-origin calls (NC-39).
export function currentUser() {
    return axios.get<ApiEnvelope<PublicUser>>(ME_URL);
}
//
export function refresh(refreshToken: string) {
    return axios.post<ApiEnvelope<LoginPayload>>(REFRESH_URL, { refresh_token: refreshToken });
}
//
export function forgotPassword(email: string) {
    return axios.post<ApiEnvelope<Record<string, never>>>(FORGOT_PASSWORD_URL, { email });
}
//
export function resetPassword(token: string, password: string) {
    return axios.post<ApiEnvelope<Record<string, never>>>(RESET_PASSWORD_URL, { token, password });
}
//
export function updateProfile(id: number, patch: Record<string, unknown>) {
    return axios.patch<ApiEnvelope<PublicUser>>(`/api/user/${id}`, patch);
}
//
export function getUserByToken(token: string): UserModel {
    return JWTModelToUserModel(jwt_decode<JWTModel>(token));
}
//
