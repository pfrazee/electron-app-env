'use strict'
const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')

module.exports = rootPaths => {
  var appFolders = []
  var emitter = new EventEmitter()
  emitter.getAppFolders = () => appFolders

  rootPaths.forEach(rootPath => {
    // TODO watch the folders and update the listing

    // iterate all children of the app-path
    fs.readdirSync(rootPath).forEach(name => {

      try {
        // is the child a folder?
        console.log('checking', name)
        const folderPath = path.join(rootPath, name)
        if (fs.statSync(folderPath).isDirectory()) {

          // does it have an index.js?
          var indexFilePath = path.join(folderPath, 'index.js')
          if (!fs.statSync(indexFilePath).isFile())
            throw "no index.js"

          // try to read the package.json
          var packageJsonFilePath = path.join(folderPath, 'package.json')
          var packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath))

          // is it an ultra app?
          if ('ultra' in packageJson) {
            // add to the list
            appFolders.push({ folderPath, packageJson })
          }
        }
      } catch (e) {
        // Ignore, one of the stat calls failed, so this folder isn't valid
        console.log(e)
      }
    })
  })

  return emitter
}
