const express = require('express');
const path = require('path');
const { exec } = require("child_process");
const { stringReplace } = require('string-replace-middleware');

const app = express();
const port = process.env.PORT || 3000;

const broadcast = process.env.BROADCAST || '10.10.0.255';
const macaddress = process.env.MACADDRESS || '00:00:00:00:00:00';
const redirectWebpage = process.env.REDIRECTWEBPAGE || 'https://www.google.com/';
const timeToRedirect = process.env.TIMETOREDIRECT || 7;
const host = process.env.HOST;
const sshFile = '/ssh/identity';

if (typeof host !== 'undefined' && host) {
    app.get('/shutdown', (req, res) => {
        exec(`ssh -oStrictHostKeyChecking=accept-new -i ${sshFile} root@${host} shutdown now`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.send("There was an error while trying to shutdown the Server please contact the administrator!");
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                res.sendFile('public/shutdown.html');
                return;
            }
            console.log(`stdout: ${stdout}`);
            res.sendFile('public/shutdown.html');
        });
    });
}

app.get('/send', (req, res) => {
    exec(`wakeonlan -i ${broadcast} ${macaddress}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    res.sendStatus(200);
});

app.use(stringReplace({
    'redirectWebpage': redirectWebpage,
    'timeToRedirect': timeToRedirect,
}))
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});