// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const {validate} = require('../res/loginIMAP');
const Store = require('electron-store');

const store = new Store();

const win = remote.getCurrentWindow(); 

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();

        var els = document.getElementsByClassName("themebutton");
        
        function setthemebuttons(){
            for(var i = 0; i < els.length; i++){
              els[i].classList.remove('active')

              if (els[i].id === store.get("userInterface.realTheme")){
                els[i].classList.add('active')
              }
            }
        }

        setthemebuttons();

        document.getElementById("dark").addEventListener('click', (event) => {
            store.set("userInterface.realTheme", 'dark');
            setthemebuttons();
        })

        document.getElementById("light").addEventListener('click', (event) => {
            store.set("userInterface.realTheme", 'light');
            setthemebuttons();
        })

        document.getElementById("system").addEventListener('click', (event) => {
            store.set("userInterface.realTheme", 'system');
            setthemebuttons();
        })

        document.getElementById("vegetta").addEventListener('click', (event) => {
            store.set("userInterface.realTheme", 'vegetta');
            setthemebuttons();
        })

        document.getElementById("nickname").value = store.get("account.nick")

        document.getElementById('changenick').addEventListener("click", function () {
            store.set("account.nick", document.getElementById("nickname").value) 
            document.getElementById('changenick').textContent = "Changed"
            setTimeout(() => {
                document.getElementById('changenick').textContent = "Change"
            }, 2000);
        })

        document.getElementById('change').addEventListener("click", function () {
            ipcRenderer.send('forceauthenticate')
        })
    }
};

window.onbeforeunload = (event) => {
    win.removeAllListeners();

    ipcRenderer.send('home')
}

function handleWindowControls() {
    
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('back-button').addEventListener("click", event => {
        win.close();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        win.maximize();
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        win.unmaximize();
    });

    

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}
