const express = require('express');
const path = require('path');
const { exec } = require("child_process");
const { stringReplace } = require('string-replace-middleware');

const app = express();
const port = process.env.PORT || 3000;

const broadcast = process.env.BROADCAST || '10.10.0.255';
const macaddress = process.env.MACADDRESS || '00:00:00:00:00:00';
const redirectWebpage = process.env.REDIRECTWEBPAGE || 'https://www.google.com/';

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
}))
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});