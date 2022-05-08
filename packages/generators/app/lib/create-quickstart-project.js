/*
 * File: create-quickstart-project.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:54:20 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:54:21 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const execa = require('execa');
// FIXME
/* eslint-disable import/extensions */
const { trackUsage, captureStderr } = require('./utils/usage');
const createProject = require('./create-project');

module.exports = async function createQuickStartProject(scope) {
  console.log('Creating a quickstart project.');
  
  await createProject(scope, configuration);

  if (scope.runQuickstartApp !== true) return;

  console.log(`Running your NextCMS application.`);

  try {
    await trackUsage({ event: 'willStartServer', scope });

    await execa('npm', ['run', 'develop'], {
      stdio: 'inherit',
      cwd: scope.rootPath,
      env: {
        FORCE_COLOR: 1,
      },
    });
  } catch (error) {
    await trackUsage({
      event: 'didNotStartServer',
      scope,
      error,
    });

    await captureStderr('didNotStartServer', error);
    process.exit(1);
  }
};