const Imap = require('imap'), inspect = require('util').inspect;
const simpleParser = require('mailparser').simpleParser;
const { EventEmitter } = require('events');
const { waitFor } = require('wait-for-event');

const mailEmitter = new EventEmitter();
let finalData=[]

let getEmailFromInbox = async (mailServer, inboxName) => {
    mailServer.openBox(inboxName, false, function (err, box) {
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
                        })
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
            });
            
        })
        }
        catch{(function (err) {return console.log(err)})};
    });
}

let createLabel = (mailServer, labelName) => {
    mailServer.addBox(labelName, (err) => {});
    console.log('message', 'New Label or Box Created');
}

let getMailboxStatusByName = (mailServer, inboxName) => {
    mailServer.status(inboxName, (err, mailbox) => {
        console.log('message', mailbox);
    });
    console.log('message', 'Label or Box Status');
}

let getMailBoxLabels = async (mailServer) => {
 
}

let deleteLabel = (mailServer, labelName) => {
    mailServer.delBox(labelName, (error) => {})
   console.log('message', 'Label or Box removed');
}

let mailServer1 = new Imap({
    user: 'intykat@black-catstudios.com',
    password: 'BCS_giraffetree17',
    host: 'mail.black-catstudios.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    },
    authTimeout: 3000
}).once('error', function (err) {
    console.log('Source Server Error:- ', err);
});

mailServer1.once('ready', async function () {
    
    mailServer1.openBox('INBOX', true, function (err, box) {
        if (err) throw err;
        console.log('message', 'server1 ready');
    }); 
    const maildata = {
        /*example:
        INBOX: [
            {
                text
                subject
                etc etc
            },
            {
                text
                subject subject
                etc etc
            }
        ]
        */
    }

    var boxes

    await mailServer1.getBoxes((error, mailbox) => {
        boxes = Object.keys(mailbox).reverse()
        mailEmitter.emit("boxesfetched")
    })

    await waitFor('boxesfetched', mailEmitter);

    console.log(boxes)

    for (var i = 0; i < boxes.length; i++) {
        console.log(boxes[i])
        getEmailFromInbox(mailServer1, boxes[i])
        await waitFor('mailfetched', mailEmitter);
        console.log(finalData);
        finalData = []
    }
    //createLabel(mailServer1, "demo-label1");
    //deleteLabel(mailServer1, "demo-label1");
    //getMailboxStatusByName(mailServer1, "INBOX");
})


mailServer1.connect();