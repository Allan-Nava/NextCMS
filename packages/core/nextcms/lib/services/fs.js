'use strict';

const path = require('path');
const fse = require('fs-extra');

/**
 * create nextcms fs layer
 */
module.exports = nextcms => {
  function normalizePath(optPath) {
    const filePath = Array.isArray(optPath) ? optPath.join('/') : optPath;

    const normalizedPath = path.normalize(filePath).replace(/^\/?(\.\/|\.\.\/)+/, '');

    return path.resolve(nextcms.dirs.root, normalizedPath);
  }

  const nextcmsFS = {
    /**
     * Writes a file in a nextcms app
     * @param {Array|string} optPath - file path
     * @param {string} data - content
     */
    writeAppFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.ensureFile(writePath).then(() => fse.writeFile(writePath, data));
    },

    /**
     * Writes a file in a plugin extensions folder
     * @param {string} plugin - plugin name
     * @param {Array|string} optPath - path to file
     * @param {string} data - content
     */
    writePluginFile(plugin, optPath, data) {
      const newPath = ['extensions', plugin].concat(optPath).join('/');
      return nextcmsFS.writeAppFile(newPath, data);
    },

    /**
     * Removes a file in nextcms app
     */
    removeAppFile(optPath) {
      const removePath = normalizePath(optPath);
      return fse.remove(removePath);
    },

    /**
     * Appends a file in nextcms app
     */
    appendFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.appendFileSync(writePath, data);
    },
  };

  return nextcmsFS;
};