const Imap = require('imap'), inspect = require('util').inspect;
const { EventEmitter } = require('events');
const { waitFor, waitForFirst } = require('wait-for-event');
const returnval = new EventEmitter();

async function validate(usr, pswd) {
    console.log("run!")
    let valid = "Unkown Error.";
    try{
    let mailServer1 =new Imap({
        user: usr,
        password: pswd,
        host: 'mail.black-catstudios.com',
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
        authTimeout: 3000
    }).once('error', function (err) {
        valid = err.message;
        returnval.emit("letsgo")
    });

    mailServer1.once('ready', function () {
        valid = null
        returnval.emit("letsgo")
    });

    mailServer1.connect();

    await waitFor("letsgo",returnval)
    mailServer1.end();
    return valid
    
} catch (e) {
    mailServer1.destroy()
    console.log("\n\n" + e)
}
}

module.exports = {validate}