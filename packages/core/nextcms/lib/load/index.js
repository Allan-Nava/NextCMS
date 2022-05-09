/*
 * File: index.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:15:04 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:15:06 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const loadFiles = require('./load-files');
const findPackagePath = require('./package-path');

module.exports = {
  loadFiles,
  findPackagePath,
};