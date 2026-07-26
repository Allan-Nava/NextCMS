/*
 * File: jest.config.js
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Unit tests for the server-side helpers (NC-31). Node environment on purpose:
// these cover auth, validation and request parsing, not React rendering.
//
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.d.ts'],
};
//
