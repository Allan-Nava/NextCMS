/*
 * File: create-customized-project.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:51:18 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:51:20 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

/* eslint-disable no-unreachable */
'use strict';
//
const createProject = require('./create-project');

module.exports = async scope => {
  return createProject(scope, configuration);
};
//