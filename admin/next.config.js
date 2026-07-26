/*
 * File: next.config.js
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:04:25 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
/** @type {import('next').NextConfig} */
const path = require('path');
//
// The panel talks to the cms API through this proxy rather than directly (NC-54).
// The browser only ever calls the admin origin, so the HttpOnly access-token
// cookie is sent with the request and forwarded upstream: no CORS to configure and
// no token kept in localStorage.
//
// CMS_ORIGIN is where the cms app answers — http://localhost:3000 in development.
const cmsOrigin = (process.env.CMS_ORIGIN || 'http://localhost:3000').replace(/\/+$/, '');
//
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URI: process.env.API_URI,
    BASE_URI: process.env.BASE_URI,
    CMS_ORIGIN: cmsOrigin,
  },
  publicRuntimeConfig: {
    API_URI: process.env.API_URI,
    BASE_URI: process.env.BASE_URI,
    CMS_ORIGIN: cmsOrigin,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  basePath: '/admin',
  async rewrites() {
    return [
      // `basePath` is applied to the source, so this matches /admin/api/* as seen
      // by the browser and forwards to the cms API.
      {
        source: '/api/:path*',
        destination: `${cmsOrigin}/api/:path*`,
      },
    ];
  },
};
//
// NOTE (NC-4): do not log the config or `process.env` here — this runs at build
// time and at boot, so it would leak into build and container logs.
module.exports = nextConfig;
