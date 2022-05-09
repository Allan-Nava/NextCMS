'use strict';

const baseConfig = require('../../../jest.base-config');
const pkg = require('./package');

module.exports = {
  ...baseConfig,
  displayName: (pkg.nextcms && pkg.nextcms.name) || pkg.name,
  roots: [__dirname],
};