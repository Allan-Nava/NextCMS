/*
 * File: user.ts
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 10:57:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { Prisma } from '@prisma/client';
//
// Projection used for every user the API returns (NC-1). The `password` column
// is deliberately absent: selecting explicitly is what stops the bcrypt hash
// from leaking, so never replace this with a bare `findMany()`.
export const publicUserSelect = {
    id: true,
    username: true,
    email: true,
    firstName: true,
    lastName: true,
    isAdmin: true,
    isStaff: true,
    updatedAt: true,
} as const;
//
export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
//
// Claims carried by an access/refresh token (NC-3). Deliberately minimal: the
// previous implementation signed the whole user row, hash included, and a JWT
// is only base64 — anyone holding a token could read it.
export interface TokenClaims {
    sub: number;
    username: string;
    isAdmin: boolean;
    isStaff: boolean;
}
//
export interface UserModel {
    id: number;
    username?: string;
    isAdmin?: boolean;
    isStaff?: boolean;
}
//
export interface JWTModel extends TokenClaims {
    iat?: number;
    exp?: number;
}
//
export const JWTModelToUserModel = (decoded: JWTModel): UserModel => {
    return {
        id: decoded.sub,
        username: decoded.username,
        isAdmin: decoded.isAdmin,
        isStaff: decoded.isStaff,
    };
};
//
