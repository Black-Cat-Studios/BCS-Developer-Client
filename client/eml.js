// hhhhhhhhhhhhhhhhhhhhhhh
const remote = require('@electron/remote');
const { ipcRenderer } = require("electron")
const { Menu, MenuItem } = remote;
const {validate} = require('../res/loginIMAP');
const Store = require('electron-store');
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const { waitFor } = require('wait-for-event');
const purify = require('dompurify')

const store = new Store();

const win = remote.getCurrentWindow(); 

const finalData = []; 

function LoadBox(mailServer, boxName){

    mailServer.closeBox([true], function(){
        mailServer.openBox(boxName, false, function (err, box) {
            if (err) throw err;
            try{
            mailServer.search(['ALL'], function (err, results) {
        
                let f = mailServer.fetch(results, {bodies: ''});
        
                f.on('message', function (msg, seqno) {
                    let uid, headers, body = '';
                    msg.on('body', function (stream, info) {
                        simpleParser(stream, (err, parsed) => {
                            var messageID = parsed.messageId.replace(/</g, ''),
                            messageID = messageID.replace(/>/g, '')
                            console.log(messageID)
                            const final = { 
                                subject: parsed.subject,
                                content: parsed.textAsHtml,
                                date: parsed.date,
                                id: messageID,
                                seqno: seqno,
                                from: parsed.from,
                                to: parsed.to,
                                inReplyTo: parsed.inReplyTo,
                                replyTo: parsed.replyTo,
                                attatchments: parsed.attachments
                            }
        
                            parsed.html ? final.html = parsed.html : final.html = false
    
                            finalData.push(final);
    
                            document.getElementById("mail").innerHTML = 
                            `
                            <div id="${messageID}" class="${seqno} mailentry">
                                <span>${String(parsed.date).split(' ')[0]} ${String(parsed.date).split(' ')[1]} ${String(parsed.date).split(' ')[2]}</span>
                                <h3>${parsed.from.value[0].name || parsed.from.value[0].address}</h3>
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
                    
                });
                
            })
            }
            catch{(function (err) {return console.log(err)})};
        });
    })
}

function previewEmail(mailId){
    for (var i = 0; i < finalData.length; i++) {
        const data = finalData[i];
        if (data.id == mailId){
            if (data.from.value[0].name){
            document.getElementById("fromname").textContent = data.from.value[0].name
            document.getElementById("fromemail").textContent = data.from.value[0].address
            } else{
                document.getElementById("fromname").textContent = data.from.value[0].address
                document.getElementById("fromemail").textContent = ""
            }
            document.getElementById('fromsubject').textContent = data.subject
            document.getElementById("fromdate").textContent = data.date.toDateString()

            if (data.html){
                document.getElementById("emailpreview").contentWindow.document.open();
                document.getElementById("emailpreview").contentWindow.document.write(purify.sanitize(data.html));
                document.getElementById("emailpreview").contentWindow.document.close();
                document.getElementById("emailpreview").style.height =  Number(document.getElementById("emailpreview").contentWindow.document.body.scrollHeight) + 20 +'px';
                document.getElementById("emailpreview").classList.remove('nonhtml');
            } else{
                document.getElementById("emailpreview").contentWindow.document.open();
                document.getElementById("emailpreview").contentWindow.document.write(data.content);
                document.getElementById("emailpreview").contentWindow.document.close();
                document.getElementById("emailpreview").style.height = 'fit-content';
                document.getElementById("emailpreview").classList.add('nonhtml');
            } 
        }
    }
};



document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {

        document.getElementById("emailpreview").contentWindow.document.onload = ()=>{
            document.getElementById("emailpreview").contentWindow.document.body.overflowY = 'hidden'
        }

        const observer = new MutationObserver(function(mutations_list) {
            mutations_list.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(added_node) {
                    added_node.addEventListener("click", () => {
                        var els = document.getElementsByClassName("activem");
                        for(var i = 0; i < els.length; i++)
                        {
                            els[i].classList.remove('activem')
                        }

                        added_node.classList.add('activem')
                        previewEmail(added_node.id);
                    });
                });
            });
        });

        

        observer.observe(document.getElementById("mail"), { subtree: false, childList: true });

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
            imap.openBox('INBOX', function(){
                LoadBox(imap, "INBOX")
            })
        });

        async function switchBox(box) {
            var els = document.getElementsByClassName("actived");
            for(var i = 0; i < els.length; i++)
            {
                els[i].classList.remove('actived')
            }
        
            document.getElementById(box).classList.add('actived')
        
            document.getElementById("mail").innerHTML = '' 
            if (box !=='Spam') {
                LoadBox(imap, box)
            }
        }

        var els = document.getElementById("boxselector").childNodes 

        for(var i = 0; i < els.length; i++)
        {
            const id = els[i].id
            els[i].addEventListener('click', () => {
                console.log(id)
                switchBox(id)
            });
        }

        document.getElementById('useremail').textContent = store.get('account.user')

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = new Menu();

            if (e.target.classList.contains("mailentry") || e.target.parentNode.classList.contains("mailentry")) {
                menu.append(new MenuItem({
                  label: "Delete",
                  click: function(){
                    if (e.target.classList.contains("mailentry")) {
                        imap.addFlags(e.target.classList[0], 'Deleted', function(err) {
                            console.log(err)
                        })
                    } else {
                        imap.addFlags(e.target.parentNode.classList[0], 'Deleted', function(err) {
                            console.log(err)
                        })
                    }
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

