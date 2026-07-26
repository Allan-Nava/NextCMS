/*
 * File: jest.config.js
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Unit tests for the admin helpers (NC-31). Node environment: these cover session
// and API-path logic, not React rendering.
//
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
};
