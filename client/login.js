// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const {validate} = require('../res/loginIMAP');
const Store = require('electron-store');

const store = new Store();

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
  
        ipcRenderer.on('loadin', function() {
            document.body.classList.add("loaded")
        });

        document.getElementById('login').addEventListener('click', async (event) => {
            document.getElementById('login').classList.add('load');
            document.getElementById('error').style.display = 'none';
            let invalid = await validate(document.getElementById('username').value + "@black-catstudios.com", document.getElementById('password').value)
            if (!invalid){
                store.set({
                    account: {
                        user: document.getElementById('username').value + "@black-catstudios.com",
                        pass: document.getElementById('password').value,
                        nick: document.getElementById('username').value
                    }
                });

                win.close();
            }else{
                document.getElementById('login').classList.remove('load');
                document.getElementById('error').textContent = invalid;
                document.getElementById('error').style.display = 'block';
            }
        });
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
