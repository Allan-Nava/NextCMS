/*
 * File: signal.js
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 6:23:21 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:23:23 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';
//
const destroyOnSignal = nextCMS => {
  let signalReceived = false;

  // For unknown reasons, we receive signals 2 times.
  // As a temporary fix, we ignore the signals received after the first one.

  const terminateNextCMS = async () => {
    if (!signalReceived) {
      signalReceived = true;
      await nextCMS.destroy();
      process.exit();
    }
  };

  ['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, terminateNextCMS);
  });
};
//
module.exports = {
  destroyOnSignal,
};
//