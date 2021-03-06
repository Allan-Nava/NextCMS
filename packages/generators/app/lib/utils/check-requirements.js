/*
 * File: check-requirements.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:56:24 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:56:26 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';

module.exports = function checkBeforeInstall() {
  var currentNodeVersion = process.versions.node;
  var semver = currentNodeVersion.split('.');
  var major = semver[0];

  if (major < 12) {
    console.error(`You are running Node ${currentNodeVersion}`);
    console.error('NextCMS requires Node 12 and higher.');
    console.error('Please make sure to use the right version of Node.');
    process.exit(1);
  }
};