/*
 * File: components.js
 * Project: @nextcms/generators
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 9th May 2022 7:56:03 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
'use strict';
//
//
const validateInput = require('./utils/validate-input');
//
module.exports = plop => {
    // Component generator
  plop.setGenerator('components', {
    description: 'Generate a component for an Dynamic Component',
    prompts: [
        {
          type: 'input',
          name: 'id',
          message: 'Dynamic Component name',
          validate: input => validateInput(input),
        },
        ...getDestinationPrompts('components', plop.getDestBasePath()),
    ],
    actions(answers) {
        const filePath = getFilePath(answers.destination);
        return [
          {
            type: 'add',
            path: `${filePath}/components/{{ id }}.js`,
            templateFile: 'templates/components.js.hbs',
          },
        ];
      },
  });
};
//