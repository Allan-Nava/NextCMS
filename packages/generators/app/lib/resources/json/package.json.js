/*
 * File: package.json.js
 * Project: <<projectname>>
 * File Created: Sunday, 8th May 2022 10:58:12 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:58:14 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

/**
 * Expose main package JSON of the application
 * with basic info, dependencies, etc.
 */

module.exports = opts => {
  const {
    strapiDependencies,
    additionalsDependencies,
    strapiVersion,
    projectName,
    uuid,
    packageJsonStrapi,
  } = opts;

  // Finally, return the JSON.
  return {
    name: projectName,
    private: true,
    version: '0.1.0',
    description: 'A NextCMS application',
    scripts: {
      develop: 'nextcms develop',
      start: 'nextcms start',
      build: 'nextcms build',
      nextcms: 'nextcms',
    },
    devDependencies: {},
    dependencies: Object.assign(
      {},
      nextcmsDependencies.reduce((acc, key) => {
        acc[key] = nextcmsVersion;
        return acc;
      }, {}),
      additionalsDependencies
    ),
    author: {
      name: 'A nextcms developer',
    },
    nextcms: {
      uuid,
      ...packageJsonNextCMS,
    },
    engines: {
      node: '>=12.x.x <=16.x.x',
      npm: '>=6.0.0',
    },
    license: 'MIT',
  };
};