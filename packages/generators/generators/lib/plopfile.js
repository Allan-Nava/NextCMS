/*
 * File: plopfile.js
 * Project: @nextcms/generators
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 7:55:32 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';
//
const pluralize = require('pluralize');
//
const generateComponents = require('./plops/components');
//
module.exports = plop => {
  // Plop config
  plop.setWelcomeMessage('NextCMS Generators');
  plop.addHelper('pluralize', text => pluralize(text));
  //
  generateComponents(plop);
  //
};