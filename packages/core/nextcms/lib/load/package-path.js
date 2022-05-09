/*
 * File: package-path.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:15:57 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:16:04 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const path = require('path');

/**
 * Returns the path to a node modules root directory (not the main file path)
 * @param {string} moduleName - name of a node module
 */
module.exports = moduleName => path.dirname(require.resolve(`${moduleName}/package.json`));