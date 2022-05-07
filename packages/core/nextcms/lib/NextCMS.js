/*
 * File: NextCMS.js
 * Project: @nextcms/nextcms
 * File Created: Saturday, 7th May 2022 4:33:19 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 7th May 2022 4:33:21 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
'use strict';
//
const _ = require('lodash');
const { isFunction } = require('lodash/fp');
const loadConfiguration = require('./core/app-configuration');
const { destroyOnSignal } = require('./utils/signals');
//
class NextCMS {
    constructor(opts = {}) {
        destroyOnSignal(this);
        const rootDir = opts.dir || process.cwd();
        const appConfig = loadConfiguration(rootDir, opts);
        this.container = createContainer(this);
        this.container.register('config', createConfigProvider(appConfig));
    }
}
//