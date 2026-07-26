/*
 * File: constants.ts
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 11:15:45 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 26th July 2026
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// `BASE_URI` used to be hardcoded to a Vercel URL with the env read commented
// out, so a self-hosted deployment silently pointed at someone else's site
// (NC-28). Both values now come from the environment; they are exposed to the
// browser through `env`/`publicRuntimeConfig` in next.config.js.
//
export const API_URI = process.env.API_URI ?? '';
export const BASE_URI = process.env.BASE_URI ?? '';
//
