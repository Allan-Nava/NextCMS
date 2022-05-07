/*
 * File: utils.js
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 6:27:54 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 6:28:01 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';

const hasNamespace = (name, namespace) => {
  if (!namespace) {
    return true;
  }

  if (namespace.endsWith('::')) {
    return name.startsWith(namespace);
  } else {
    return name.startsWith(`${namespace}.`);
  }
};

const addNamespace = (name, namespace) => {
  if (namespace.endsWith('::')) {
    return `${namespace}${name}`;
  } else {
    return `${namespace}.${name}`;
  }
};

const removeNamespace = (name, namespace) => {
  if (namespace.endsWith('::')) {
    return name.replace(namespace, '');
  } else {
    return name.replace(`${namespace}.`, '');
  }
};

module.exports = {
  addNamespace,
  removeNamespace,
  hasNamespace,
};