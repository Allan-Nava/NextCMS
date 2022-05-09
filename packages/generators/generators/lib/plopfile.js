'use strict';

const pluralize = require('pluralize');

const generateController = require('./plops/controller');
const generateContentType = require('./plops/content-type');
//
module.exports = plop => {
  // Plop config
  plop.setWelcomeMessage('NextCMS Generators');
  plop.addHelper('pluralize', text => pluralize(text));

};