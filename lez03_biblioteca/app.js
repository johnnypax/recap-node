const express = require('express');

const HOST = 'localhost';
const PORT = 3000;

const app = express();

app.use(express.json());

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

let libri = [
    {
        id: 1,
        titolo: 'Il Signore degli Anelli',
        autore: 'J.R.R Tolkien'
    },
    {
        id: 2,
        titolo: 'Il Silmarillion',
        autore: 'J.R.R Tolkien'
    }
];
let lastId = 2;

app.get('/libri', (req, res) => {
    res.json(libri);
});

app.get('/libri/:id', (req, res) => {
    const id = parseInt(req.params.id);

    for(let i = 0; i<libri.length; i++) {
        if(libri[i].id == id) {
            res.json(libri[i]);
            return;
        }
    }
    res.status(404).json({ message: 'Libro non trovato' });
});

app.post('/libri', (req, res) => {
    const nuovoLibro = req.body;
    if(!nuovoLibro.titolo || !nuovoLibro.autore) {  //Check di validità dei dati
        res.status(400).json({ message: 'Titolo e autore sono obbligatori' });
        return;
    }

    nuovoLibro.id = lastId + 1;
    libri.push(nuovoLibro);

    lastId++;

    res.status(201).json(nuovoLibro);
});

// Delete
// Update
// Ricerca libri per autore