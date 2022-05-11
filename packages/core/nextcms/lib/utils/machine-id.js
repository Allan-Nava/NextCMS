/*
 * File: machine-id.js
 * Project: @nextcms/nextcms
 * File Created: Monday, 9th May 2022 7:51:39 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 11th May 2022 8:57:04 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

'use strict';
//
const { machineIdSync } = require('node-machine-id');
const uuid = require('uuid');
//
module.exports = () => {
  try {
    const deviceId = machineIdSync();
    return deviceId;
  } catch (error) {
    const deviceId = uuid();
    return deviceId;
  }
};