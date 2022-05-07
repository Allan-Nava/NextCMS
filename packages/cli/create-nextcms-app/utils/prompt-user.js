/*
 * File: prompt-user.js
 * Project: create-nextcms-app
 * File Created: Saturday, 7th May 2022 4:21:03 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 4:21:05 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';

const inquirer = require('inquirer');

/**
 * @param {string|null} projectName - The name/path of project
 * @param {string|null} template - The Github repo of the template
 * @returns Object containting prompt answers
 */
module.exports = async function promptUser(projectName, program) {
  const questions = await getPromptQuestions(projectName, program);
  return inquirer.prompt(questions);
};

/**
 * @param {string|null} projectName - The name of the project
 * @param {string|null} template - The template the project should use
 * @returns Array of prompt question objects
 */
async function getPromptQuestions(projectName, program) {
  return [
    {
      type: 'input',
      default: 'my-nextcms-project',
      name: 'directory',
      message: 'What would you like to name your project?',
      when: !projectName,
    },
    {
      type: 'list',
      name: 'quick',
      message: 'Choose your installation type',
      when: !program.quickstart,
      choices: [
        {
          name: 'Quickstart (recommended)',
          value: true,
        },
        {
          name: 'Custom (manual settings)',
          value: false,
        },
      ],
    },
  ];
}