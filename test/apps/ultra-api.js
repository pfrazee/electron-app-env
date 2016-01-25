'use strict'
// TODO factor this out into the `ultra-api` module -prf

var muxrpc = require('muxrpc')
var pull = require('pull-stream')
var ipcApiStream = require('../../src/ipc-api-stream')

const IPC_MANIFEST = {
  registerService: 'sync',
  queryServices: 'sync',
  log: 'sync'
}

// was this process started by ultra?
function isActive () {
  // `process.send` will only exist if an stdio ipc interface is active
  // see https://nodejs.org/api/child_process.html
  return !!process.send
}

// setup ipc api
var ipcStream = ipcApiStream(process, function(err) { console.error(err); throw 'ultra-api ipc stream was killed' })
var ipcApi = muxrpc(IPC_MANIFEST, {}, msg => msg)({})
pull(ipcStream, ipcApi.createStream(), ipcStream)

// export the api
module.exports = ipcApi
module.exports.isActive = isActive