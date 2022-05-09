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
const ee = require('./utils/ee');
const loaders = require('./core/loaders');
const createConfigProvider = require('./core/registries/config');
//
class NextCMS {
    constructor(opts = {}) {
        destroyOnSignal(this);
        const rootDir = opts.dir || process.cwd();
        const appConfig = loadConfiguration(rootDir, opts);
        this.container = createContainer(this);
        this.container.register('config', createConfigProvider(appConfig));
        //
        this.dirs = utils.getDirs(rootDir, { nextcms: this });
        //
        this.isLoaded = false;
        this.reload = this.reload();
        this.log = createLogger(this.config.get('logger', {}));
        //
    }
    //
    get config() {
        return this.container.get('config');
    }
    //
    get EE() {
        return ee({ dir: this.dirs.root, logger: this.log });
    }
    get plugins() {
      return this.container.get('plugins').getAll();
    }

    plugin(name) {
      return this.container.get('plugins').get(name);
    }
    //
    async start() {
        try {
        if (!this.isLoaded) {
            await this.load();
        }

        await this.listen();

        return this;
        } catch (error) {
        return this.stopWithError(error);
        }
    }
    //
    async bootstrap() {
        const contentTypes = [
          coreStoreModel,
          webhookModel,
          ...Object.values(nextcms.contentTypes),
          ...Object.values(nextcms.components),
        ];
    
        const cronTasks = this.config.get('server.cron.tasks', {});
        this.cron.add(cronTasks);
    
        this.telemetry.bootstrap();
    
    
        await this.startWebhooks();
    
        await this.runLifecyclesFunctions(LIFECYCLES.BOOTSTRAP);
    
        this.cron.start();
    
        return this;
    }
    
    async load() {
        await this.register();
        await this.bootstrap();
    
        this.isLoaded = true;
    
        return this;
    }
    
    async startWebhooks() {
        const webhooks = await this.webhookStore.findWebhooks();
        webhooks.forEach(webhook => this.webhookRunner.add(webhook));
    }
    
    reload() {
        const state = {
          shouldReload: 0,
        };
    
        const reload = function() {
          if (state.shouldReload > 0) {
            // Reset the reloading state
            state.shouldReload -= 1;
            reload.isReloading = false;
            return;
          }
    
          if (this.config.get('autoReload')) {
            process.send('reload');
          }
        };
    
        Object.defineProperty(reload, 'isWatching', {
          configurable: true,
          enumerable: true,
          set(value) {
            // Special state when the reloader is disabled temporarly (see GraphQL plugin example).
            if (state.isWatching === false && value === true) {
              state.shouldReload += 1;
            }
            state.isWatching = value;
          },
          get() {
            return state.isWatching;
          },
        });
    
        reload.isReloading = false;
        reload.isWatching = true;
    
        return reload;
    }
    //
    stopWithError(err, customMessage) {
        this.log.debug(`⛔️ Server wasn't able to start properly.`);
        if (customMessage) {
            this.log.error(customMessage);
        }
    
        this.log.error(err);
        return this.stop();
    }
    //
    stop(exitCode = 1) {
        this.destroy();
    
        if (this.config.get('autoReload')) {
            process.send('stop');
        }
    
        // Kill process
        process.exit(exitCode);
    }
    //
}
//
//
module.exports = options => {
    const nextcms = new NextCMS(options);
    global.nextcms = nextcms;
    return nextcms;
};
//
module.exports.NextCMS = NextCMS;
//