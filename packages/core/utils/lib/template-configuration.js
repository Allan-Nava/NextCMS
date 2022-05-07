/*
 * File: template-configuration.js
 * Project: @nextcms/utils
 * File Created: Saturday, 7th May 2022 6:58:26 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:58:30 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';

const { isString, isPlainObject } = require('lodash');

const regex = /\$\{[^()]*\}/g;
const excludeConfigPaths = ['info.scripts'];

/**
 * Allow dynamic config values through the native ES6 template string function.
 */
const templateConfiguration = (obj, configPath = '') => {
  // Allow values which looks like such as an ES6 literal string without parenthesis inside (aka function call).
  // Exclude config with conflicting syntax (e.g. npm scripts).
  return Object.keys(obj).reduce((acc, key) => {
    if (isPlainObject(obj[key]) && !isString(obj[key])) {
      acc[key] = templateConfiguration(obj[key], `${configPath}.${key}`);
    } else if (
      isString(obj[key]) &&
      !excludeConfigPaths.includes(configPath.substr(1)) &&
      obj[key].match(regex) !== null
    ) {
      // eslint-disable-next-line prefer-template
      acc[key] = eval('`' + obj[key] + '`');
    } else {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
};

module.exports = templateConfiguration;