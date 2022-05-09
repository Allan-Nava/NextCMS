/*
 * File: console.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 9:13:42 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 9:13:45 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const REPL = require('repl');
const nextcms = require('../index');

/**
 * `$ nextcms console`
 */
module.exports = () => {
  // Now load up the NextCMS framework for real.
  const app = nextcms();

  app.start().then(() => {
    const repl = REPL.start(app.config.info.name + ' > ' || 'nextcms > '); // eslint-disable-line prefer-template

    repl.on('exit', function(err) {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }

      app.server.destroy();
      process.exit(0);
    });
  });
};