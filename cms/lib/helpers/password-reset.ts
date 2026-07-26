/*
 * File: password-reset.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Password reset tokens (NC-39).
//
// The database only ever sees the SHA-256 hash of a token, for the same reason
// passwords are hashed: a database dump must not be enough to take over an
// account. The plaintext lives only in the link handed to the user.
//
import { createHash, randomBytes } from 'crypto';
import prisma from '../prisma';
import { envOrDefault } from '../utils/env';
import { logger } from '../utils/logger';
//
export interface IssuedToken {
    token: string;
    expiresAt: Date;
}
//
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
//
function ttlMinutes(): number {
    const parsed = Number(envOrDefault('PASSWORD_RESET_TTL_MINUTES', '30'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}
//
export const passwordResetRepo = {
    issue,
    consume,
};
//
// Any token still outstanding for the user is invalidated first, so asking for a
// second link cannot leave two working ones behind.
async function issue(userId: number): Promise<IssuedToken> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes() * 60_000);
    await prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
    });
    await prisma.passwordResetToken.create({
        data: { tokenHash: hashToken(token), userId, expiresAt },
    });
    logger.info('password reset token issued', { userId });
    return { token, expiresAt };
}
//
// Returns the user id when the token is valid and marks it used in the same
// step, so a token cannot be redeemed twice.
async function consume(token: string): Promise<number | null> {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record) {
        logger.debug('password reset refused: unknown token');
        return null;
    }
    if (record.usedAt !== null) {
        logger.warn('password reset refused: token already used', { userId: record.userId });
        return null;
    }
    if (record.expiresAt.getTime() <= Date.now()) {
        logger.debug('password reset refused: token expired', { userId: record.userId });
        return null;
    }
    const claimed = await prisma.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
    });
    // Zero rows means another request claimed it between the read and the write.
    if (claimed.count === 0) {
        logger.warn('password reset refused: token claimed concurrently', { userId: record.userId });
        return null;
    }
    return record.userId;
}
//
