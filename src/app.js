const express = require('express');
const path = require('path');
const { exec } = require("child_process");
const { stringReplace } = require('string-replace-middleware');

const app = express();
const port = process.env.PORT || 3000;

const broadcast = process.env.BROADCAST || '10.10.0.255';
const macaddress = process.env.MACADDRESS || '00:00:00:00:00:00';
const redirectWebpage = process.env.REDIRECTWEBPAGE || 'https://www.google.com/';
const timeToRedirect = process.env.TIMETOREDIRECT || 35;
const host = process.env.HOST;
const sshFile = '/ssh/identity';

if (typeof host !== 'undefined' && host) {
    app.get('/shutdown', async(req, res) => {
        exec(`ssh -oBatchMode=yes -oStrictHostKeyChecking=accept-new -i ${sshFile} root@${host} shutdown now`, (error, stdout, stderr) => {
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
        await sleep(5000);
        res.redirect('/shutdown2');
    });

    app.get('/shutdown2', (req, res) => {
        exec(`nc -vz ${host} 22`, (error, stdout, stderr) => {
            if (error) {
                // The PC is off
                console.log(`error: ${error.message}`);
                res.sendFile(path.join(__dirname, 'public/', 'shutdown.html'));
                return;
            }
            if (stderr) {
                // The PC is still on
                console.log(`stderr: ${stderr}`);
                res.sendFile(path.join(__dirname, 'public/', 'shutdownerror.html'));
                return;
            }
            console.log(`stdout: ${stdout}`);
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

app.get('/check', (req, res) => {
    exec(`nc -vz ${host} 22`, (error, stdout, stderr) => {
        if (error) {
            // The PC is off
            console.log(`error: ${error.message}`);
            res.sendStatus(502);
            return;
        }
        if (stderr) {
            // The PC is still on
            console.log(`stderr: ${stderr}`);
            res.sendStatus(200);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
});

app.use(stringReplace({
    'redirectWebpage': redirectWebpage,
    'timeToRedirect': timeToRedirect,
}))
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}