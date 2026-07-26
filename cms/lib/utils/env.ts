/*
 * File: env.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Typed access to environment variables (NC-2). Values are read lazily, never
// at module load, so `next build` does not need production secrets to be set.
//
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
    }
    return value;
}
//
export function envOrDefault(name: string, fallback: string): string {
    const value = process.env[name];
    return value && value.length > 0 ? value : fallback;
}
//
export function envFlag(name: string, fallback = false): boolean {
    const value = process.env[name];
    if (value === undefined || value === '') return fallback;
    return value === '1' || value.toLowerCase() === 'true';
}
//
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
//
