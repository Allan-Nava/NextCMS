/*
 * File: startup-logger.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 11th May 2022 8:57:50 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';

const chalk = require('chalk');
const CLITable = require('cli-table3');
const _ = require('lodash/fp');
const { getAbsoluteAdminUrl, getAbsoluteServerUrl } = require('@nextcms/utils');
const ee = require('./ee');

module.exports = app => {
  return {
    logStats() {
        const columns = Math.min(process.stderr.columns, 80) - 2;
        console.log();
        console.log(chalk.black.bgWhite(_.padEnd(columns, ' Project information')));
        console.log();
  
        const infoTable = new CLITable({
          colWidths: [20, 50],
          chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        });
  
        const isEE = app.EE === true && ee.isEE === true;
  
        infoTable.push(
          [chalk.blue('Time'), `${new Date()}`],
          [chalk.blue('Launched in'), Date.now() - app.config.launchedAt + ' ms'],
          [chalk.blue('Environment'), app.config.environment],
          [chalk.blue('Process PID'), process.pid],
          [chalk.blue('Version'), `${app.config.info.nextcms} (node ${process.version})`],
          [chalk.blue('Edition'), isEE ? 'Enterprise' : 'Community']
        );
  
        console.log(infoTable.toString());
        console.log();
        console.log(chalk.black.bgWhite(_.padEnd(columns, ' Actions available')));
        console.log();
      },
  
      logFirstStartupMessage() {
        this.logStats();
  
        console.log(chalk.bold('One more thing...'));
        console.log(
          chalk.grey('Create your first administrator 💻 by going to the administration panel at:')
        );
        console.log();
  
        const addressTable = new CLITable();
  
        const adminUrl = getAbsoluteAdminUrl(nextcms.config);
        addressTable.push([chalk.bold(adminUrl)]);
  
        console.log(`${addressTable.toString()}`);
        console.log();
      },
  
      logDefaultStartupMessage() {
        this.logStats();
  
        console.log(chalk.bold('Welcome back!'));
  
        if (app.config.serveAdminPanel === true) {
          console.log(chalk.grey('To manage your project 🚀, go to the administration panel at:'));
          const adminUrl = getAbsoluteAdminUrl(nextcms.config);
          console.log(chalk.bold(adminUrl));
          console.log();
        }
  
        console.log(chalk.grey('To access the server ⚡️, go to:'));
        const serverUrl = getAbsoluteServerUrl(nextcms.config);
        console.log(chalk.bold(serverUrl));
        console.log();
      },
  
      logStartupMessage({ isInitialized } = {}) {
        // Should the startup message be displayed?
        const hideStartupMessage = process.env.NEXTCMS_HIDE_STARTUP_MESSAGE
          ? process.env.NEXTCMS_HIDE_STARTUP_MESSAGE === 'true'
          : false;
  
        if (hideStartupMessage === false) {
          if (!isInitialized) {
            this.logFirstStartupMessage();
          } else {
            this.logDefaultStartupMessage();
          }
        }
      },
    };
};