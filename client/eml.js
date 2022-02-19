// hhhhhhhhhhhhhhhhhhhhhhh
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const { Menu, MenuItem } = remote;
const {validate} = require('../res/loginIMAP');
const Store = require('electron-store');
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const { EventEmitter } = require('events');
const { waitFor } = require('wait-for-event');

const store = new Store();

const win = remote.getCurrentWindow(); 

const finalData = []; 
const mailEmitter = new EventEmitter();

function LoadBox(mailServer, boxName){
    mailServer.openBox(boxName, false, function (err, box) {
        if (err) throw err;
        try{
        mailServer.search(['ALL'], function (err, results) {
    
            let f = mailServer.fetch(results, {bodies: ''});
    
            f.on('message', function (msg, seqno) {
                let uid, headers, body = '';
                msg.on('body', function (stream, info) {
                    simpleParser(stream, (err, parsed) => {
                        finalData.push({ 
                            subject: parsed.subject,
                            content: parsed.textAsHtml,
                            date: parsed.date,
                            id: parsed.messageId,
                            from: parsed.from,
                            to: parsed.to,
                            inReplyTo: parsed.inReplyTo,
                            replyTo: parsed.replyTo,
                            attatchments: parsed.attachments
                        });

                        document.getElementById("mail").innerHTML = 
                        `
                        <div id="${parsed.messageId}" class="mailentry">
                            <span>${String(parsed.date).split(' ')[0]} ${String(parsed.date).split(' ')[1]} ${String(parsed.date).split(' ')[2]}</span>
                            <h3>${parsed.from.text}</h3>
                            <p>${parsed.subject}</p>
                        </div>
                        ` + document.getElementById("mail").innerHTML
                    });
                });
                /*msg.once('attributes', function (attrs) {
                    uid = attrs.uid;
                    console.log(attrs);
                });*/
            })
    
            f.once("error", function (err) {
                return conslole.log(err);
            });

            f.once("end",function(){
                mailEmitter.emit('mailfetched')
                loadEmail();
            });
            
        })
        }
        catch{(function (err) {return console.log(err)})};
    });
}

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
        
        var imap = new Imap({
            user: store.get("account.user"),
            password: store.get("account.pass"),
            host: 'mail.black-catstudios.com',
            port: 993,
            tls: true
        });

        imap.connect();

        imap.once('ready', function() {
            document.getElementById("mail").innerHTML = '' 
            LoadBox(imap, "INBOX")
        });

        document.getElementById('useremail').textContent = store.get('account.user')

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = new Menu();

            if (e.target.classList.contains("mailentry") || e.target.parentNode.classList.contains("mailentry")) {
                menu.append(new MenuItem({
                  label: "Delete",
                  click: function(){
                    alert(`you clicked on ${e.target.id}`);
                  }
                }));

                menu.append(new MenuItem({
                    type: "separator"
                }));
              }

            menu.append(new MenuItem(new MenuItem({
                label: "Back to home",
                click: function(){
                    ipcRenderer.send('home'); 
                }
            })));

            menu.append(new MenuItem({
                type: "separator"
            }));

            menu.append(new MenuItem(
                new MenuItem({
                    label: "Copy",
                    role: 'copy',
                }), 
            ));

            menu.append(new MenuItem(
                new MenuItem({
                    label: "Cut",
                    role: 'cut',
                }),
            ));

            menu.append(new MenuItem(
                new MenuItem({
                    label: "Paste",
                    role: 'paste',
                }),
            ));

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

function loadEmail() {
    for (var i = 0; i < finalData.length; i++) {
        const entry = finalData[i];
        console.log(document.getElementById(entry.id))
        document.getElementById(entry.id).addEventListener("click", function(){
            console.log(entry)
        });
    }
}