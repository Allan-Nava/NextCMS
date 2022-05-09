'use strict';

const { getConfigUrls } = require('@nextcms/utils');
const fse = require('fs-extra');

module.exports = async function({ nextcms }) {
    nextcms.config.port = nextcms.config.get('server.port') || nextcms.config.port;
    nextcms.config.host = nextcms.config.get('server.host') || nextcms.config.host;
  
    const { serverUrl, adminUrl, adminPath } = getConfigUrls(nextcms.config);
  
    nextcms.config.server = nextcms.config.server || {};
    nextcms.config.server.url = serverUrl;
    nextcms.config.admin.url = adminUrl;
    nextcms.config.admin.path = adminPath;
  
    // check if we should serve admin panel
    const shouldServeAdmin = strapi.config.get(
      'admin.serveAdminPanel',
      nextcms.config.get('serveAdminPanel')
    );
  
    if (!shouldServeAdmin) {
        nextcms.config.serveAdminPanel = false;
    }
  
    // ensure public repository exists
    if (!(await fse.pathExists(nextcms.dirs.public))) {
      throw new Error(
        `The public folder (${nextcms.dirs.public}) doesn't exist or is not accessible. Please make sure it exists.`
      );
    }
  };