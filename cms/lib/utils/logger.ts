/*
 * File: logger.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Minimal levelled logger (NC-32). It replaces the bare `console.log` calls
// that used to dump whole request objects — headers and cookies included, so
// tokens ended up in the logs (NC-7).
//
// RULE: never pass a NextApiRequest/NextApiResponse, a raw Prisma `User`, a
// password or a token to these functions. Log identifiers, not payloads.
//
import { envOrDefault, isProduction } from './env';
//
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
//
const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
//
function threshold(): number {
    const configured = envOrDefault('LOG_LEVEL', isProduction() ? 'info' : 'debug') as LogLevel;
    return LEVELS[configured] ?? LEVELS.info;
}
//
function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LEVELS[level] < threshold()) return;
    const line = `[${level}] ${message}`;
    const target = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    if (meta === undefined) {
        target(line);
    } else {
        target(line, meta);
    }
}
//
export const logger = {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
//
