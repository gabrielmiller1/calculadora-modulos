const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // Gambiarra para security.

let webContents;

const { ipcMain } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        resizable: false,
        height: 650,
        backgroundColor: "rgba(237, 237, 237, 1)",
        show: false,
        icon: path.join(__dirname, "assets/icons/icon.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    webContents = win.webContents;

    // win.loadFile("./pages/login/index.html");
    win.loadFile("./pages/home/index.html");

    win.once("ready-to-show", function () {
        win.show();

        win.webContents.openDevTools(); // openDevTool

        let menuTemplate = [{
            label: "Acesso Rapido",
            submenu: [
                {
                    label: "Home",
                    click: () => {
                        win.loadURL(`file://${__dirname}/pages/home2/index.html`)
                    }
                },
                {
                    label: "Body",
                    submenu: [
                        {
                            label: "Em desenvolvimento",
                            click: () => { }
                        }
                    ]
                },
                {
                    label: "ECU",
                    submenu: [
                        {
                            label: "Em desenvolvimento",
                            click: () => { }
                        }
                    ]
                },
                {
                    label: "Imobilizador",
                    submenu: [
                        {
                            label: 'GM',
                            submenu: [
                                {
                                    label: "OPEL 2R",
                                    click: () => {
                                        win.loadURL(`file://${__dirname}/pages/gm/opel-2r/opel-2r.html`)
                                    }
                                },
                                {
                                    label: "OPEL 2",
                                    click: () => {
                                        win.loadURL(`file://${__dirname}/pages/gm/opel-2/index.html`)
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    label: "Painel",
                    submenu: [
                        {
                            label: "Em desenvolvimento",
                            click: () => { }
                        }
                    ]
                }]
        }];

        process.plataform == 'darwin' ? menuTemplate.unshift({ label: app.getName() }) : menuTemplate;

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    });
}

app.on('ready', createWindow);

// Função botão voltar.
ipcMain.on('go-back', (event) => {
    // Obtém a instância de webContents atual
    const webContents = event.sender;

    // Volta para a página anterior
    webContents.goBack();
});

// Função fechar app.
ipcMain.on('close-app', () => {
    app.quit();
})