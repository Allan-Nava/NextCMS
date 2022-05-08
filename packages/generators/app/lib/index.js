/*
 * File: index.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:43:07 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:43:09 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';
//
const { join, resolve, basename } = require('path');
const os = require('os');
const crypto = require('crypto');
const uuid = require('uuid/v4');
//


const generateNewApp = (projectDirectory, cliArguments) => {
    checkRequirements();
  
    const rootPath = resolve(projectDirectory);

};
//


function initCancelCatcher() {
    // Create interface for windows user to let them quit the program.
    if (process.platform === 'win32') {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
  
      rl.on('SIGINT', function() {
        process.emit('SIGINT');
      });
    }
  
    process.on('SIGINT', () => {
      process.exit(1);
    });
}
// 
module.exports = {
    generateNewApp,
    checkInstallPath,
};
//