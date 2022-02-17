// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const Store = require('electron-store');
const store = new Store();

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();

        document.body.classList.remove("loaded")
  
        ipcRenderer.once('loadin', function(event) {
            document.getElementById("user").textContent = store.get('account.nick')
            document.body.classList.add("loaded")
        });

        document.getElementById("int").addEventListener('click', async (event) => {
            document.getElementById("int").classList.add("active")  
            document.getElementById("act").classList.remove("active") 
            document.getElementById("builtin").style.display = "none"
            document.getElementById("integrated").style.display = "flex"
        });

        document.getElementById("act").addEventListener('click', async (event) => {
            document.getElementById("act").classList.add("active")  
            document.getElementById("int").classList.remove("active") 
            document.getElementById("integrated").style.display = "none"
            document.getElementById("builtin").style.display = "flex"
        });

        document.getElementById("settbutton").addEventListener('click', function(event) {
            ipcRenderer.send("opensettings")
        })
    }
};

window.onbeforeunload = (event) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
    win.removeAllListeners();
}

function handleWindowControls() {

    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        win.maximize();
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        win.unmaximize();
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
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
