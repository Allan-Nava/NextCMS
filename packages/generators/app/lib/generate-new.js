/*
 * File: generate-new.js
 * Project: next-cms
 * File Created: Sunday, 8th May 2022 10:46:27 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 8th May 2022 10:46:35 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
'use strict';
//
/**
 * Module dependencies
 */
const { trackUsage } = require('./utils/usage');
const checkInstallPath = require('./utils/check-install-path');
const createCustomizeProject = require('./create-customized-project');
const createQuickStartProject = require('./create-quickstart-project');
//
//
module.exports = async scope => {
    console.log("scope ", scope);
    // check rootPath is empty
    checkInstallPath(scope.rootPath);
    //
    await trackUsage({ event: 'willCreateProject', scope });
    //
    // if cli quickstart create project with default sqlite options
    if (scope.quick === true) {
        return createQuickStartProject(scope);
    }
    // create a project with full list of questions
    return createCustomizeProject(scope);
};