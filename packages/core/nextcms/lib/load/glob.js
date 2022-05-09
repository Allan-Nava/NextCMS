/*
 * File: glob.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:16:27 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:16:28 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const glob = require('glob');

/**
 * Promise based glob
 */
module.exports = (...args) => {
  return new Promise((resolve, reject) => {
    glob(...args, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
};