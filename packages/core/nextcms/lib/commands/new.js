/*
 * File: new.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:12:58 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:12:59 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

   
'use strict';

const { generateNewApp } = require('@nextcms/generate-new');

/**
 * `$ nextcms new`
 *
 * Generate a new NextCMS application.
 */

module.exports = function(...args) {
  return generateNewApp(...args);
};