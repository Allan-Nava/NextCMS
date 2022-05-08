/*
 * File: has-yarn.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:55:12 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:55:14 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const execa = require('execa');

module.exports = function hasYarn() {
  try {
    const { code } = execa.shellSync('yarnpkg --version');
    if (code === 0) return true;
    return false;
  } catch (err) {
    return false;
  }
};