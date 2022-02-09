const {app, BrowserWindow} = require('electron');
const path = require('path')
const Data = require('./res/data.js');
require("dotenv").config();
const {validate} = require('./res/loginIMAP');

let mainWindow;

function loadEmail(win){
    win.loadFile("./html/email.html")
}

const data = new Data({
    configName: "user-preferences",
    defaults:{
        account: null,
        theme: "dark"
    }
})

async function authenticate(){

    let account = data.get("account")   

    function createAuthWin(){
        var authwin = new BrowserWindow({
            width: 400,
            height: 400,
            frame: false,
            backgroundColor: '#FFF',
            hasShadow: false,
            icon: './icons/logo.png',
            resizable: false,
            fullscreenable: false,
            minimizable: false,
            maximizable: false,
            closable: false,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            }
        });

        authwin.loadFile('./html/login.html');
        authwin.center();

        require("@electron/remote/main").enable(authwin.webContents)

        return authwin;
    }

    if (!account) {
        createAuthWin();
    } else if(await validate(account.email,account.password)){
        createAuthWin();
    }

}

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        backgroundColor: '#FFF',
        show: false,
        hasShadow: false,
        icon: './icons/logo.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    mainWindow.loadFile('./html/index.html');

    require("@electron/remote/main").enable(mainWindow.webContents)

    var splash = new BrowserWindow({
        width: 550, 
        height: 290, 
        transparent: true, 
        frame: false, 
        alwaysOnTop: true, 
        fullscreenable: false,
        minimizable: false,
        maximizable: false,
        resizable: false,
        icon: './icons/logo.png',
    });
    
    splash.loadFile('./html/splash.html');
    splash.center();
    
    setTimeout(function () {
        splash.close();
        authenticate();
        mainWindow.show();
    }, 10000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

require('@electron/remote/main').initialize()