/*
 * File: success.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 11th May 2022 8:56:51 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

/**
 * Module dependencies
 */

const fetch = require('node-fetch');
const machineID = require('./machine-id');

/*
 * No need to worry about this file, we only retrieve anonymous data here.
 * It allows us to know on how many times the package has been installed globally.
 */

try {
  if (
    process.env.npm_config_global === 'true' ||
    JSON.parse(process.env.npm_config_argv).original.includes('global')
  ) {
    fetch('https://analytics.nextcms.io/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'didInstallNextCMS',
        deviceId: machineID(),
      }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
} catch (e) {
  //...
}