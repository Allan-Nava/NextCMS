/*
 * File: next.config.js
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:04:25 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 9:19:59 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
/** @type {import('next').NextConfig} */
const path = require('path');
//const { ADMIN_URL } = process.env;
console.log("process ",process.env);
//
const nextConfig = {
  reactStrictMode: true,
  env:{
    API_URI: process.env.API_URI,
    BASE_URI: process.env.BASE_URI
  },
  publicRuntimeConfig: {
    API_URI: process.env.API_URI,
    BASE_URI: process.env.BASE_URI
  },
  future: {
    webpack5: true, // by default, if you customize webpack config, they switch back to version 4. 
      // Looks like backward compatibility approach.
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `/:path*`,
      },
      {
        source: '/admin',
        destination: `${process.env.ADMIN_URL}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${process.env.ADMIN_URL}/admin/:path*`,
      },
    ]
  },
}
//
module.exports = nextConfig;
//
