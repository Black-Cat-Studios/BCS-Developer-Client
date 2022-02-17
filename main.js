const {app, BrowserWindow, ipcMain, nativeTheme} = require('electron');
const path = require('path')
const Store = require('electron-store');
require("dotenv").config();
const {validate} = require('./res/loginIMAP');
const defaul = {
    userInterface: {
        theme: "dark",
        realTheme: 'system'
    }
}

const store = new Store({
    defaults: defaul,
});

//let account = data.get("account") 

let mainWindow;

function loadEmail(win){
    win.loadFile("./html/email.html")
}
const realTheme = store.get("userInterface.realTheme")

if(realTheme === "system"){
    if(nativeTheme.shouldUseDarkColors){
        store.set("userInterface.theme","dark")
    } else{
        store.set("userInterface.theme","light")
    }
} else{
    store.set("userInterface.theme",realTheme)
}

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

    authwin.once('close', function() {
        mainWindow.webContents.send("loadin") 
     });

    require("@electron/remote/main").enable(authwin.webContents)

    return authwin;
}

async function authenticate(){

    var account = store.get('account')
    if (!account) {
        createAuthWin();
    } else if(await validate(account.user,account.pass)){
        createAuthWin();
    } else{
        mainWindow.webContents.send("loadin")
    }
}

ipcMain.on('forceauthenticate', function(){
    createAuthWin();
})

ipcMain.on('reload', function() {
    app.relaunch()
    app.exit()
})

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 650,
        minWidth: 800,
        minHeight: 600,
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

    mainWindow.loadFile('./html/email.html');

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

ipcMain.on("opensettings", function () {
    var settWin = new BrowserWindow({
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
        parent: mainWindow,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    settWin.loadFile('./html/settings.html');
    settWin.center();

    require("@electron/remote/main").enable(settWin.webContents)
})

require('@electron/remote/main').initialize()