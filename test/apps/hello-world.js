'use strict'
var http = require('http')
var ultra = require('./ultra-api')

// read config from env vars
var port = process.env.PORT

// create the HTTP server
console.log('listening at port', port)
http.createServer(function (req, res) {
  res.writeHead(200, 'Ok', { 'Content-Type': 'text/html' })
  res.end('Hello, world')
}).listen(port)


console.log('registering')
if (ultra.isActive()) {
  // register the http server with ultra
  ultra.registerService({
    title: 'Hello World Application',
    hostname: 'helloworld',
    port: port,
    protocols: ['http'],
    interfaces: ['page']
  })
}