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

const { trackError, captureException } = require('./utils/usage');
const generateNew = require('./generate-new');
const checkInstallPath = require('./utils/check-install-path');
//
//
const generateNewApp = (projectDirectory, cliArguments) => {
    checkRequirements();
  
    const rootPath = resolve(projectDirectory);
    const tmpPath = join(os.tmpdir(), `nextCMS${crypto.randomBytes(6).toString('hex')}`);

    const useNpm = cliArguments.useNpm !== undefined;

    const scope = {
      rootPath,
      name: basename(rootPath),
      // disable quickstart run app after creation
      runQuickstartApp: cliArguments.run === false ? false : true,
      // use pacakge version as nextCMSVersion (all packages have the same version);
      nextCMSVersion: require('../package.json').version,
      debug: cliArguments.debug !== undefined,
      quick: cliArguments.quickstart,
      template: cliArguments.template,
      packageJsonNextCMS: {
        template: cliArguments.template,
        starter: cliArguments.starter,
      },
      uuid: (process.env.NEXTCMS_UUID_PREFIX || '') + uuid(),
      docker: process.env.DOCKER === 'true',
      deviceId: machineID(),
      tmpPath,
      // use yarn if available and --use-npm isn't true
      useYarn: !useNpm && hasYarn(),
      installDependencies: true,
      nextCMSDependencies: [
        '@nextcms/nextcms'
      ],
      additionalsDependencies: {},
    };
    initCancelCatcher(scope);

    return generateNew(scope).catch(error => {
      console.error(error);
      return captureException(error).then(() => {
        return trackError({ scope, error }).then(() => {
          process.exit(1);
        });
      });
    });
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