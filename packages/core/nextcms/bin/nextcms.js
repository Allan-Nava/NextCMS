/*
 * File: nextcms.js
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 6:08:15 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:08:16 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
// #!/usr/bin/env node
'use strict';

// FIXME
/* eslint-disable import/extensions */
const _ = require('lodash');
const resolveCwd = require('resolve-cwd');
const { yellow } = require('chalk');
const { Command } = require('commander');

const program = new Command();

const packageJSON = require('../package.json');

const checkCwdIsNextCMSApp = name => {
  console.log("name ",name);
  let logErrorAndExit = () => {
    console.log(
      `You need to run ${yellow(
        `nextcms ${name}`
      )} in a NextCMS project. Make sure you are in the right directory.`
    );
    process.exit(1);
  };

  try {
    const pkgJSON = require(process.cwd() + '/package.json');
    if (!_.has(pkgJSON, 'dependencies.@nextcms/nextcms')) {
      logErrorAndExit(name);
    }
  } catch (err) {
    logErrorAndExit(name);
  }
};

const getLocalScript = name => (...args) => {
  checkCwdIsNextCMSApp(name);

  const cmdPath = resolveCwd.silent(`@nextcms/nextcms/lib/commands/${name}`);
  if (!cmdPath) {
    console.log(
      `Error loading the local ${yellow(
        name
      )} command. NextCMS might not be installed in your "node_modules". You may need to run "yarn install".`
    );
    process.exit(1);
  }

  const script = require(cmdPath);

  Promise.resolve()
    .then(() => {
      return script(...args);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
};

// Initial program setup
program.storeOptionsAsProperties(false).allowUnknownOption(true);

program.helpOption('-h, --help', 'Display help for command');
program.addHelpCommand('help [command]', 'Display help for command');

// `$ nextcms version` (--version synonym)
program.version(packageJSON.version, '-v, --version', 'Output the version number');
program
  .command('version')
  .description('Output the version of NextCMS')
  .action(() => {
    process.stdout.write(packageJSON.version + '\n');
    process.exit(0);
  });

// `$ nextcms console`
program
  .command('console')
  .description('Open the NextCMS framework console')
  .action(getLocalScript('console'));

// `$ nextcms new`
program
  .command('new <directory>')
  .option('--no-run', 'Do not start the application after it is created')
  .option('--use-npm', 'Force usage of npm instead of yarn to create the project')
  .option('--debug', 'Display database connection errors')
  .option('--quickstart', 'Create quickstart app')
  .description('Create a new application')
  .action(require('../lib/commands/new'));

// `$ nextcms start`
program
  .command('start')
  .description('Start your NextCMS application')
  .action(getLocalScript('start'));

// `$ nextcms develop`
program
  .command('develop')
  .alias('dev')
  .option('--no-build', 'Disable build')
  .option('--watch-admin', 'Enable watch', false)
  .option('--polling', 'Watch for file changes in network directories', false)
  .option('--browser <name>', 'Open the browser', true)
  .description('Start your NextCMS application in development mode')
  .action(getLocalScript('develop'));

// $ nextcms generate
program
  .command('generate')
  .description('Launch the interactive API generator')
  .action(() => {
    checkCwdIsNextCMSApp('generate');
    process.argv.splice(2, 1);
    require('@nextcms/generators').runCLI();
  });

// `$ nextcms generate:template <directory>`
program
  .command('templates:generate <directory>')
  .description('Generate template from NextCMS project')
  .action(getLocalScript('generate-template'));

program
  .command('build')
  .option('--no-optimization', 'Build the admin app without optimizing assets')
  .description('Build the nextcms admin app')
  .action(getLocalScript('build'));

// `$ nextcms install`
program
  .command('install [plugins...]')
  .description('Install a NextCMS plugin')
  .action(getLocalScript('install'));

// `$ nextcms uninstall`
program
  .command('uninstall [plugins...]')
  .description('Uninstall a NextCMS plugin')
  .option('-d, --delete-files', 'Delete files', false)
  .action(getLocalScript('uninstall'));

//   `$ nextcms watch-admin`
program
  .command('watch-admin')
  .option('--browser <name>', 'Open the browser', true)
  .description('Start the admin development server')
  .action(getLocalScript('watchAdmin'));

program
  .command('configuration:dump')
  .alias('config:dump')
  .description('Dump configurations of your application')
  .option('-f, --file <file>', 'Output file, default output is stdout')
  .option('-p, --pretty', 'Format the output JSON with indentation and line breaks', false)
  .action(getLocalScript('configurationDump'));

program
  .command('configuration:restore')
  .alias('config:restore')
  .description('Restore configurations of your application')
  .option('-f, --file <file>', 'Input file, default input is stdin')
  .option('-s, --strategy <strategy>', 'Strategy name, one of: "replace", "merge", "keep"')
  .action(getLocalScript('configurationRestore'));

//    `$ nextcms opt-out-telemetry`
program
  .command('telemetry:disable')
  .description('Stop NextCMS from sending anonymous telemetry and metadata')
  .action(getLocalScript('opt-out-telemetry'));

program.parseAsync(process.argv);