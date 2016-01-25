'use strict'
var path = require('path')

const DEFAULT_APPS_PATH = [path.join(__dirname, './node_modules')]

// apps path - array of places to look for an application.
module.exports.getAppsPath = () => {
  // not configurable. 
  // reason: I'm not sure it's safe to accept environment-parameters on code locations
  // -prf
  return DEFAULT_APPS_PATH
}