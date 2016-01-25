'use strict'
var http = require('http')
var ultra = require('./ultra-api')

// read config from env vars
var port = process.env.PORT

// create the HTTP server
console.log('listening at port', port)
http.createServer(function (req, res) {
  res.writeHead(200, 'Ok', { 'Content-Type': 'text/html' })
  res.end('<html><head><title>Hello World Application</title></head><body>Hello, world</body></html>')
}).listen(port)


console.log('registering')
if (ultra.isActive()) {
  // register the http server with ultra
  ultra.registerService({
    title: 'Hello World Application',
    appname: 'helloworld',
    port: port,
    protocols: ['http'],
    interfaces: ['page']
  })
}