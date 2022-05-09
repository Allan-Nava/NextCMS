'use strict';

const { isEmpty, isNil } = require('lodash/fp');

/**
 * Test if the nextcms application is considered as initialized (1st user has been created)
 * @param {nextcms} nextcms
 * @returns {boolean}
 */
module.exports = async function isInitialized(nextcms) {
  try {
    if (isEmpty(nextcms.admin)) {
      return true;
    }

    // test if there is at least one admin
    const anyAdministrator = await nextcms.query('admin::user').findOne({ select: ['id'] });

    return !isNil(anyAdministrator);
  } catch (err) {
    nextcms.stopWithError(err);
  }
};