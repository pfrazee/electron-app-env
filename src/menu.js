var Menu = require('electron').Menu
var dialog = require('electron').dialog
var pkg = require('../package')
var windows = require('./windows')

var isMac = (process.platform == 'darwin')

function showAbout(win) {
  dialog.showMessageBox(win, {
    title: 'About Ultra',
    buttons: ['Close', 'License'],
    type: 'info',
    icon: 'assets/icon.png',
    message: pkg.name + ' v' + pkg.version,
    detail: pkg.description + '\n\n' +
      'Copyright © 2015-2016 Secure Scuttlebutt Consortium'
  }, function (btn) {
    if (btn == 1)
      showLicense(win)
  })
}

function showLicense(win) {
  dialog.showMessageBox(win, {
    title: 'License',
    buttons: ['Close'],
    message: pkg.license,
    detail: 'This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.'
  })
}

module.exports = function (config) {
  var template = [
    {
      label: 'Ultra',
      submenu: [
        {
          label: 'About Ultra',
          role: 'about',
          click: function (item, win) {
            showAbout(win)
          }
        },
      ].concat(isMac ? [
        {
          type: 'separator'
        },
        {
          label: 'Hide Ultra',
          accelerator: 'Command+H',
          selector: 'hide:',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Option+Command+H',
          selector: 'hideOtherApplications:',
        role: 'hideothers'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:',
          role: 'unhide'
        },
      ] : [], [
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function (item, win) {
            require('electron').app.quit()
          }
        }
      ])
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Ctrl+Command+F';
            else
              return 'F11';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: function (item, win) { 
            win.toggleDevTools()
          }
        }
      ]
    },
    isMac ? {
      label: 'Window',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: function (item, win) {
            var newWindow = windows.create()
            newWindow.loadURL('app:launch')
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: function (item, win) {
            win.close()
          }
        },
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:',
          role: 'front'
        }
      ]
    } : {}
  ]

  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}