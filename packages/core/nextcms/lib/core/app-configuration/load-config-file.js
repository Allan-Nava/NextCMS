/*
 * File: load-config-file.js
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 6:27:05 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:27:07 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { templateConfiguration, env } = require('@nextcms/utils');

const loadJsFile = file => {
  try {
    const jsModule = require(file);

    // call if function
    if (typeof jsModule === 'function') {
      return jsModule({ env });
    }

    return jsModule;
  } catch (error) {
    throw new Error(`Could not load js config file ${file}: ${error.message}`);
  }
};

const loadJSONFile = file => {
  try {
    return templateConfiguration(JSON.parse(fs.readFileSync(file)));
  } catch (error) {
    throw new Error(`Could not load json config file ${file}: ${error.message}`);
  }
};

const loadFile = file => {
  const ext = path.extname(file);

  switch (ext) {
    case '.js':
      return loadJsFile(file);
    case '.json':
      return loadJSONFile(file);
    default:
      return {};
  }
};

module.exports = loadFile;