'use strict'
const path = require('path')
const argv = require('yargs').argv

const DEFAULT_APPS_PATH = [path.join(__dirname, '../node_modules')]
const TEST_APPS_PATH = [path.join(__dirname, '../test/apps')]

const getEnv =
module.exports.getEnv = () => {
  return argv.env || 'default'
}

// apps path - array of places to look for an application.
const getAppsPath =
module.exports.getAppsPath = () => {
  // not directly configurable. 
  // reason: I'm not sure it's safe to accept environment-parameters on code locations
  // -prf
  if (getEnv() == 'test')
    return TEST_APPS_PATH
  return DEFAULT_APPS_PATH
}

// emit the banner
console.log('[CFG] env:', getEnv())
console.log('[CFG] apps path:', getAppsPath())