const { app, BrowserWindow, Menu } = require('electron');
const path =require('path');

function createWindow() {
    const win = new BrowserWindow({
      width: 1300,
      resizable: false,
      height: 750,
      backgroundColor: "rgba(237, 237, 237, 1)",
      show: false,
      icon: path.join(__dirname, "assets/icons/icon.png"),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  
    win.loadFile("./src/home/index.html");
  
    win.once("ready-to-show", function () {
      win.show();

      win.webContents.openDevTools();

      const menuTemplate = [
        {
          label:"Aplicações",
          submenu: [
            {
                label:"BMW",
                submenu: [
                    {
                        label:"Correçao FRM",
                        click: () => {}
                    }
                ]
            },
            {
                label:"FIAT",
                submenu: [
                    {
                        label:"Airbag",
                        click: () => {}
                    },
                    {
                        label:"Reset ECU Ducato",
                        click: () => {}
                    },
                    {
                        label:"Reset ECU Marelli",
                        click: () => {}
                    }
                ]
            },
            {
                label:"FORD",
            },
            {
                label:"GM",
                submenu: [
                    {
                        label:"Airbag",
                        click: () => {}
                    },
                    {
                        label:"Reset ECU Ducato",
                        click: () => {}
                    },
                    {
                        label:"Reset ECU Marelli",
                        click: () => {}
                    },
                    {
                        label:"OPEL 2R",
                        click: () => {}
                    },

                ]
            },
            {
                label:"HYUNDAI",
            },
            {
                label:"IVECO",
            },
            {
                label:"KIA",
            },
            {
                label:"RENAULT",
            },
            {
                label:"VW",
            }
          ]
        },
      ];
      const menu = Menu.buildFromTemplate(menuTemplate);
      Menu.setApplicationMenu(menu);
    });
  }
  
  app.whenReady().then(() => {
    createWindow();
  });