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
export function getUserByToken(token: string): UserModel {
    return JWTModelToUserModel(jwt_decode<JWTModel>(token));
}
//
