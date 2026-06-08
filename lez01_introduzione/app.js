const express = require('express');
const app = express();

const PORT = 3000;
const HOST = 'localhost';

app.listen(PORT, HOST, () => {
    console.log("Server is running on http://" + HOST + ":" + PORT);
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

app.get('/', (req, res) => {
    res.send("Ciao mondo!");
});

app.get('/giovanni', (req, res) => {
    const gio = {
        nome: "Giovanni",
        cognome: "Pace",
        eta: 20
    };

    res.json(gio);
});