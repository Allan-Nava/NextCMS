/*
 * File: robots.txt.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { GetServerSideProps } from 'next';
import { buildRobots } from '../lib/utils/sitemap';
import { envOrDefault } from '../lib/utils/env';
//
// GET /robots.txt (NC-69). Served dynamically so the sitemap URL follows
// BASE_URI instead of being baked in at build time.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.write(buildRobots({ baseUrl: envOrDefault('BASE_URI', '') }));
    res.end();
    return { props: {} };
};
//
export default function Robots(): null {
    return null;
}
//
