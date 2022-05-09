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