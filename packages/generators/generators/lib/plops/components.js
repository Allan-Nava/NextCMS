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