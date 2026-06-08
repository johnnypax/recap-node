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
        autore: 'J.R.R. Tolkien'
    },
    {
        id: 2,
        titolo: 'Il Silmarillion',
        autore: 'J.R.R. Tolkien'
    },
    {
        id: 3,
        titolo: 'Lo Hobbit',
        autore: 'J.R.R. Tolkien'
    },
    {
        id: 4,
        titolo: '1984',
        autore: 'George Orwell'
    },
    {
        id: 5,
        titolo: 'La fattoria degli animali',
        autore: 'George Orwell'
    },
    {
        id: 6,
        titolo: 'Il nome della rosa',
        autore: 'Umberto Eco'
    },
    {
        id: 7,
        titolo: 'Il barone rampante',
        autore: 'Italo Calvino'
    },
    {
        id: 8,
        titolo: 'Se questo è un uomo',
        autore: 'Primo Levi'
    },
    {
        id: 9,
        titolo: 'I promessi sposi',
        autore: 'Alessandro Manzoni'
    },
    {
        id: 10,
        titolo: 'Il fu Mattia Pascal',
        autore: 'Luigi Pirandello'
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
    if(!nuovoLibro.titolo.trim() || !nuovoLibro.autore.trim()) {  //Check di validità dei dati
        res.status(400).json({ message: 'Titolo e autore sono obbligatori' });
        return;
    }

    nuovoLibro.id = lastId + 1;
    libri.push(nuovoLibro);

    lastId++;

    res.status(201).json(nuovoLibro);
});

// Delete -> http://localhost:3000/libri/7
app.delete("/libri/:id", (req, res) => {

    const valId = req.params.id;            // id = 7

    for(let i=0; i<libri.length; i++){
        if(libri[i].id == valId){
            libri.splice(i, 1);
            res.status(200).json({message: "STAPPOOOOOO"});
            return;
        }
    }

    res.status(404).message({message: "Non trovato"});
});

app.put("/libri/:id", (req, res) => {
    const valId = req.params.id;

    if(!req.body.titolo.trim() || !req.body.autore.trim()){
        res.status(400).json({"message": "Errore, necessari titolo e autore"});
        return;
    }

    for(let i=0; i<libri.length; i++){
        if(libri[i].id == valId){
            libri[i].titolo = req.body.titolo ? req.body.titolo : libri[i].titolo;
            libri[i].autore = req.body.autore ? req.body.autore : libri[i].autore;

            res.status(200).json({message: "STAPPOOOOOO"});
            return;
        }
    }
    
    res.status(404).json({message: "Non trovato"});
})

// Update
// Ricerca libri per autore

