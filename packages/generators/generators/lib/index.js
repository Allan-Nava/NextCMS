/*
 * File: index.js
 * Project: @nextcms/generators
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 7:55:16 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';
//
const { join } = require('path');
const { Plop, run } = require('plop');
const nodePlop = require('node-plop');
//
/**
 * Starts the Plop CLI programmatically
 */
const runCLI = () => {
  Plop.launch({ configPath: join(__dirname, 'plopfile.js') }, env =>
    run({ ...env, dest: join(process.cwd(), 'src') }, undefined, true)
  );
};

/**
 * Runs a generator programmatically without prompts
 * @param {string} generatorName
 * @param {Object} options generator options replacing the prompts answers
 * @param {Object} plopOptions
 * @param {string} plopOptions.dir base path for plop to generate the files from
 */
const generate = async (generatorName, options, { dir = process.cwd() } = {}) => {
  const plop = nodePlop(join(__dirname, 'plopfile.js'), { destBasePath: join(dir, 'src') });

  const generator = plop.getGenerator(generatorName);
  await generator.runActions(options, {
    onSuccess() {},
    onFailure() {},
    onComment() {},
  });
};

module.exports = {
  generate,
  runCLI,
};