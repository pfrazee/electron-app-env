'use strict'
var appsManager = require('./apps-manager')

module.exports = function (req, res) {
  console.log(req.method, req.url)

  if (req.url == '/') {
    var services = appsManager.getServiceList()
    // console.log(services)

    res.writeHead(200, 'Ok', { 'Content-Type': 'text/html' })
    res.write(`<h1>Launcher</h1>`)
    res.write(`<ul>`)
    res.write(
      services
        .filter(service => service.isApp)
        .map(service => `<li><a href="app:${service.hostname}">${service.title}</a></li>`).join('')
    )
    res.write(`</ul>`)
    res.end()
  } else {
    res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain' })
    res.end('not found')
  }
}