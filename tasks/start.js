'use strict';

var electron = require('electron-prebuilt');
var childProcess = require('child_process');

var app = childProcess.spawn(electron, ['./src'].concat(process.argv.slice(2)), {
    stdio: 'inherit'
})

app.on('close', function (code) {
    // User closed the app. Kill the host process.
    process.exit()
})