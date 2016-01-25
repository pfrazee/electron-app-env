'use strict'
var electron = require('electron')
var windows = require('./windows')
var setupMainMenu = require('./menu')
var appsManager = require('./apps-manager')
var path = require('path')
var config = require('./config')
var http = require('http')
var httpServer = require('./http-server')

electron.app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // ----- ^ actually, not for now, it makes debugging harder
  // if (process.platform != 'darwin') {
    electron.app.quit()
  // }
})
electron.app.on('before-quit', function () {
  appsManager.killAll()  
})

electron.app.on('ready', function() {
  setupMainMenu(config)

  http.createServer(httpServer).listen(9999, function () {
    // register core services
    appsManager.registerService({
      title: 'Ultra Launcher',
      appname: 'launch',
      port: 9999,
      protocols: ['http'],
      interfaces: ['page']
    })

    // start applications
    // DEBUG spawn hello world
    appsManager.spawn(path.join(__dirname, '../test/apps/hello-world.js'))

    // register app: protocol
    electron.protocol.registerHttpProtocol('app', appsManager.protocolHandler, function (err) {
      if (err)
        throw err

      // DEBUG wait a second to open the window, so hello-world can register
      setTimeout(() => {
        var mainWindow = windows.create()
        mainWindow.loadURL('app:launch')
      }, 1e3)
    })
  })
})