Electron App Env
=====

This is a browser that runs web-servers on the device.
It's not yet complete.

A typical application:

`index.js`
```js
var http = require('http')
var eappenv = require('eappenv')

// read config from env vars
var port = process.env.PORT

// create the HTTP server
http.createServer(function (req, res) {
  res.writeHead(200, 'Ok', { 'Content-Type': 'text/html' })
  res.end('Hello, world')
}).listen(port)

// register the service with eappenv
eappenv.registerService({
  title: 'Hello World Application',
  appname: 'helloworld',
  port: port,
  protocols: ['http'],
  interfaces: ['page']
})
```

`manifest.json`
```json
{
  "id": "helloworld",
  "name": "Hello World Application",
  "short_name": "HW App",
  "display": "standalone"
}
```

The manifest is an extension of the [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest).

## Overview

Motivation: there's a [community](https://github.com/ssbc) of developers who want to create desktop apps using web tech.
These apps need to provide & share services, and be convenient to access.

EAppEnv is like Chrome Apps, but for Electron and Node.
It manages configuration, app lifecycle, and inter-app communication, and provides a unified experience (such as via its launcher).

So, EAppEnv handles:
 - Port assignment and other config
 - A service registry, to discover other applications on the device
 - App/server lifecycle, so users aren't having to manage daemons
 - The UI Windows and overall user experience
 - The electron runtime, so you dont have to bundle it with your app

And, in the future, it may also do:
 - Secret/credential management
 - Backend sandboxing
 - Automatic updating of applications

### How apps use it

A node app adds a `manifest.json`, for EAppEnv to read its basic settings.
The user installs the app by putting it in EAppEnv's applications directory.
After that, it will be run automatically and appear in the launcher.

Config (such as port assignment) is given to the app via ENV vars.
The app can also register with a service registry, using an STDIO IPC channel to EAppEnv, but this is optional.
The service registry assists discovery; for instance, an application that wrapped SQLite might register itself here as a SQL service.

### App Lifecycle & Config

EAppEnv orchestrates the applications so they can depend on each other.
It runs them in child processes, and passes config via environment variables.
It also establishes an IPC interface using [node's stdio api](https://nodejs.org/api/child_process.html#child_process_options_stdio), which is what powers the `eappenv` api.

### Service Registry

The applications are expected to create services at their assigned port range.
They can then announce the services to EAppEnv, and query the registry.
When they find services by other applications they want to use, they can establish connections and do work.

This is an important part of the environment.
It lets applications depend on each other, and avoid duplicated functionality.

### URL Scheme

EAppEnv introduces the `app:` scheme using [electron's protocol api](http://electron.atom.io/docs/v0.36.5/api/protocol/).
This scheme integrates with EAppEnv's app-registry to route requests to the active applications.

The scheme is very simple:

```
app-url        = "app:" <appname> "/" <path>
app-identifier = [A-z0-9-._]+
path           = [A-z0-9-._~:/?#[]@!$&'()*+,;=]*
```

Some example URLs:

```
app:notifications
app:mail/compose
app:mail/view/%258gV+3yzSEUiWulnOq7aUiNMD1ckGICjPumWw8m5SG38=.sha256
````

A request to `app:notifications` would look in the manifests of active apps for the `related_applications[eappenvI].id` of `notifications`.
If an entry is found, the request would be routed to that service (eg to `localhost:9999`).

Some notes about how these URLs work:
 - The URLs are generally expected to serve HTML pages, but can support other behaviors as well.
 - They are *always* served by an `http://localhost:<port>` address.
 - Services can share an id. If that happens, the user's asked which application they want to use when they click on a link.

### UI

EAppEnv creates and manages the windows.
The `BrowserWindow` is created with typical web security, no browser plugin-support, and no node integration.
Therefore the application frontends behave mostly like in typical Web apps.

The [manifest `display` attr](https://developer.mozilla.org/en-US/docs/Web/Manifest#display) and `eappenv` api will control the decoration of the windows.
EAppEnv adds `frameless` to create a window with no browsing or OS chrome.

### Default Applications

Some applications are included with EAppEnv, by default, and cannot be overridden by userland.

`app:launch` provides the standard open-window interface.

### Security & Sandboxing

EAppEnv's `BrowserWindow` will be sandboxed with standard web-security.

Unfortunately, we don't have a node sandbox tool at our disposal yet, and so the backend process is given full access to node APIs, as a regular process.

### Web / EAppEnv Portability

EAppEnv is designed to be as un-intrusive as possible.
Applications can test whether they're being run by EAppEnv, or stand-alone in node, and run correctly for either environment.

This has two results:

 1. It's easy to port an exist node web-app to EAppEnv
 2. An EAppEnv app can act as a web-app for remote access in a standard browser


## Howto Use

### Run from source

```
cd ~
git clone https://github.com/pfraze/eappenv.git
cd eappenv
npm install
npm start
```

### Testing

If you run using `npm test` instead of `npm start`, EAppEnv will load using `./test/apps` as its apps path.

### Building into a platform-specific program

```
npm run release
```

### More info

This repo is based on https://github.com/szwacz/electron-boilerplate.
Check that repo to get more information on the structure and scripts.


## Howto Write an App

Refer to [test/apps/hello-world](./test/apps/hello-world) for help.

Create a standard node project, with a `package.json` and `index.js`.
In the `package.json`, include an "app" attribute at the toplevel.
For now, it's value just needs to be truthy.


## API

The `eappenv` provides a set of methods for interacting with EAppEnv from the applications.

### registerService(opts)

### queryServices(opts)

### openWindow(opts)

