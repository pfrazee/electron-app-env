'use strict'

var childProcess = require('child_process')
var pathlib = require('path')
var url = require('url')
var which = require('which')
var ipcApiStream = require('./ipc-api-stream')
var muxrpc = require('muxrpc')
var pull = require('pull-stream')
var zerr = require('zerr')

const NODE_PATH = which.sync('node')
if (NODE_PATH)
  console.log('Node path:', NODE_PATH)
else {
  console.error('Node not found on this system. Please install the latest nodejs.')
  process.exit(1)
}

const IPC_MANIFEST = {
  registerService: 'sync',
  queryServices: 'sync'
}
const IPC_API = { registerService, queryServices }
const NotYetImplementedError = zerr('NotYetImplemented')

// what's the first port we'll assign?
const BASE_PORT = 10000

// how many ports does each process get?
const PORT_RANGE = 10

// active applications, list of app-objects
var apps = []

// port allocations, map of port -> app-object
var portRegistry = {}

// registered services, list of service-objects
var serviceList = []
module.exports.getServiceList = () => serviceList

// hostname assingments, map of hostname -> [list of service-objects]
var hostnameRegistry = {}
module.getHostnameRegistry = () => hostnameRegistry

// finds a port range that's not allocated yet
function getFreePortRange () {
  for (var i = BASE_PORT; i < 65e3; i += PORT_RANGE) {
    if (!(i in portRegistry))
      return i
  }
}

module.exports.spawn = function (path) {

  // allocate a port
  var port = getFreePortRange()

  // spawn the process
  var childProcessInstance = childProcess.spawn(NODE_PATH, [path], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    cwd: pathlib.dirname(path),
    env: {
      PORT: port
    }
  })
  console.log(path, '- started. Port:', port)

  // setup ipc api
  var ipcApi = muxrpc({}, IPC_MANIFEST, msg => msg)(IPC_API)

  // add to the registry
  var app = {
    path: path,
    port: port,
    process: childProcessInstance,
    ipcStream: ipcStream,
    ipcApi: ipcApi,
    hostnames: [],
    state: { isAlive: true, code: null, signal: null }
  }
  apps.push(app)
  portRegistry[port] = app

  // recursive reference: put app on app.ipcApi
  // this is cleaned up in childprocess 'close' handler
  ipcApi.id = app
  var ipcStream = ipcApiStream(childProcessInstance, function() { /*console.log('ipc stream is closed')*/ })
  pull(ipcStream, ipcApi.createStream(), ipcStream)

  // watch for process death
  childProcessInstance.on('close', function (code, signal) {
    console.log(path, '- stopped. Code:', code, 'Signal:', signal)

    // record new state
    app.state.isAlive = false
    app.state.code = code
    app.state.signal = signal

    // remove from registries
    delete portRegistry[port]
    serviceList = serviceList.filter(service => service.port !== app.port)
    app.hostnames.forEach(hostname => {
      hostnameRegistry = hostnameRegistry[hostname].filter(service => service.port !== app.port)
    })

    // break recursive reference
    ipcApi.app = null
  })
  return app
}

module.exports.killAll = function (signal) {
  apps.forEach(app => app.process.kill(signal || 'SIGHUP'))
}

module.exports.protocolHandler = function (req, cb) {
  const urlParsed = url.parse(req.url)

  // lookup the services
  var services = hostnameRegistry[urlParsed.hostname]
  // console.log(urlParsed.hostname, services, hostnameRegistry)

  // 404?
  if (!services || services.length === 0) {
    return cb({ url: 'http://localhost:9999/not-found', method: 'get' })
  }

  // TODO handle condition where services.length > 1 (multiple registered hostnames for one id)
  cb({
    url: 'http://localhost:'+services[0].port,
    method: req.method
  })
}

function registerService (service) {
  // console.log('registering service', this.id.port, service)
  // TODO validate

  service.isApp = !!this.id // if no .id is provided, then it's ultra registering a service

  // add to main listing
  serviceList.push(service)

  if (service.hostname) {
    // track the app id registry in the app object, to help with cleanup
    if (service.isApp)
      this.id.hostnames.push(service.hostname)

    // add to the registry
    hostnameRegistry[service.hostname] = hostnameRegistry[service.hostname] || []
    hostnameRegistry[service.hostname].push(service)
  }
}
module.exports.registerService = registerService

function queryServices (opts) {
  // TODO
  throw new NotYetImplementedError()
}
module.exports.queryServices = queryServices