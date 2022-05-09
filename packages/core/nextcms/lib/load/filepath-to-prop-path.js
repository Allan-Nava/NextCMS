/*
 * File: filepath-to-prop-path.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:16:53 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:17:13 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';

const _ = require('lodash');

/**
 * Returns a path (as an array) from a file path
 * @param {string} filePath - a file path
 * @param {boolean} useFileNameAsKey - wethear to skip the last path key
 */
module.exports = (filePath, useFileNameAsKey = true) => {
  let cleanPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;

  const prop = cleanPath
    .replace(/(\.settings|\.json|\.js)/g, '')
    .toLowerCase()
    .split('/')
    .map(p => _.trimStart(p, '.'))
    .join('.')
    .split('.');

  return useFileNameAsKey === true ? prop : prop.slice(0, -1);
};