/*
 * File: create-nextcms-app.js
 * Project: next-cms
 * File Created: Saturday, 7th May 2022 4:11:04 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 4:11:05 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';
//
const { resolve } = require('path');
const commander = require('commander');
const { checkInstallPath, generateNewApp } = require('@nextcms/generate-new');
const promptUser = require('./utils/prompt-user');
// eslint-disable-next-line import/extensions
const packageJson = require('./package.json');

const program = new commander.Command(packageJson.name);
//
program
  .version(packageJson.version)
  .arguments('[directory]')
  .option('--no-run', 'Do not start the application after it is created')
  .option('--use-npm', 'Force usage of npm instead of yarn to create the project')
  .option('--debug', 'Display database connection error')
  //.option('--template <templateurl>', 'Specify a Next CMS template')
  .description('create a new application')
  .action(directory => {
    initProject(directory, program);
  })
  .parse(process.argv);
//
function generateApp(projectName, options) {
    if (!projectName) {
      console.error('Please specify the <directory> of your project when using --quickstart');
      process.exit(1);
    }
    console.log("options ", options);
    return generateNewApp(projectName, options).then(() => {
      if (process.platform === 'win32') {
        process.exit(0);
      }
    });
  }
  
  async function initProject(projectName, program) {
    if (projectName) {
      await checkInstallPath(resolve(projectName));
    }
  
    if (program.quickstart) {
      return generateApp(projectName, program);
    }
  
    const prompt = await promptUser(projectName, program);
  
    const directory = prompt.directory || projectName;
    await checkInstallPath(resolve(directory));
  
    const options = {
      template: program.template,
      quickstart: prompt.quick || program.quickstart,
    };
  
    const generateNextCMSAppOptions = {
      ...program,
      ...options,
    };
  
    return generateApp(directory, generateNextCMSAppOptions);
  }