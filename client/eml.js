// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const { Menu, MenuItem } = remote;
const {validate} = require('../res/loginIMAP');
const Store = require('electron-store');

const store = new Store();

const win = remote.getCurrentWindow(); 

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();

        document.getElementById('useremail').textContent = store.get('account.user')

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = new Menu();

            menu.append(new MenuItem(new MenuItem({
                label: "Back to home",
                click: function(){
                    ipcRenderer.send('home'); 
                }
            })));

            if (e.target.classList.contains("mailentry") || e.target.parentNode.classList.contains("mailentry")) {
              menu.append(new MenuItem({
                label: "Delete",
                click: function(){
                  alert(`you clicked on ${e.target.id}`);
                }
              }));
            }

            menu.popup({ window: win })
          }, false)


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

    document.getElementById('back-button').addEventListener("click", event => {
        ipcRenderer.send("home");
    })

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
