//Giovanni Pace
const express = require('express')
const app = express()

app.use(express.json())

const PORT = 3000
const HOST = 'localhost'

app.listen(PORT, HOST, () => {
    console.log("Sono connesso!")
})

let missions = [
    {
        id: 1,
        title: "Analisi dei Log",
        description: "Prova prova",
        category: "Test ICT",
        difficulty: "HARD",
        estimatedMinutes: 120,
        status: "ACTIVE",
        score: 5,
        requiredTools: ['PC', 'Router'],
        solution: "Prova",
        createdAt: Date.now(),
        updatedAt: null,
        completedAt: null
    },
    {
        id: 2,
        title: "Configurazione Rete LAN",
        description: "Configura una piccola rete locale collegando più dispositivi tramite switch e assegnando correttamente gli indirizzi IP.",
        category: "Networking",
        difficulty: "MEDIUM",
        estimatedMinutes: 90,
        status: "DRAFT",
        score: 4,
        requiredTools: ['PC', 'Switch', 'Cavi Ethernet'],
        solution: "Assegnare gli IP ai dispositivi, verificare la connettività con ping e controllare la tabella ARP.",
        createdAt: Date.now(),
        updatedAt: null,
        completedAt: null
    },
    {
        id: 3,
        title: "Hardening Sistema Linux",
        description: "Metti in sicurezza un server Linux disabilitando servizi inutili, configurando il firewall e creando un utente con privilegi limitati.",
        category: "Cybersecurity",
        difficulty: "HARD",
        estimatedMinutes: 150,
        status: "ACTIVE",
        score: 5,
        requiredTools: ['PC', 'Linux VM', 'Terminale'],
        solution: "Creare un nuovo utente, configurare UFW, disabilitare servizi non necessari e verificare le porte aperte.",
        createdAt: Date.now(),
        updatedAt: null,
        completedAt: null
    },
    {
        id: 4,
        title: "Creazione API REST",
        description: "Sviluppa una semplice API REST per gestire una risorsa con operazioni di lettura, inserimento, modifica ed eliminazione.",
        category: "Backend Development",
        difficulty: "MEDIUM",
        estimatedMinutes: 180,
        status: "ACTIVE",
        score: 4,
        requiredTools: ['PC', 'Node.js', 'Postman'],
        solution: "Creare gli endpoint GET, POST, PUT e DELETE, testandoli con Postman e restituendo risposte JSON coerenti.",
        createdAt: Date.now(),
        updatedAt: null,
        completedAt: null
    }
];

let lastId = 4;

app.get("/api/missions", (req, res) => {
    res.json(missions)
})

app.get("/api/missions/:id", (req, res) => {
    const varId = req.params.id

    for (let i = 0; i < missions.length; i++) {
        if (missions[i].id == varId) {
            res.json(missions[i])
            return
        }
    }

    res.status(404).json({ message: "Missione non trovata!" })
})

app.post("/api/missions", (req, res) => {
    let nuovaMissione = req.body;

    if (!nuovaMissione.title || nuovaMissione.title.trim() == "" ||
        !nuovaMissione.description || nuovaMissione.description.trim() == "") {
        res.status(400).json({ message: "Problema con la richiesta" })
        return
    }

    nuovaMissione.id = lastId + 1
    nuovaMissione.createdAt = Date.now()

    missions.push(nuovaMissione)

    lastId++
    res.status(201).json(nuovaMissione)
})

app.delete("/api/missions/:id", (req, res) => {
    if (req.params.id.trim() == "") {
        res.status(400).json({ message: "Attenzioooooone, campo obbligatorio" })
        return
    }

    const varId = parseInt(req.params.id)

    for (let i = 0; i < missions.length; i++) {
        if (missions[i].id === varId) {
            missions.splice(i, 1)
            res.status(200).json({ message: "Stappoooooo" })
            return
        }
    }

    res.status(404).json({ message: "Errore, non trovato" })
})

app.put("/api/missions/:id", (req, res) => {
    const varId = req.params.id
    const oggettoModificato = req.body;

    if (!oggettoModificato.title || oggettoModificato.title.trim() == "" ||
        !oggettoModificato.description || oggettoModificato.description.trim() == "") {
        res.status(400).json({ message: "Problema con la richiesta" })
        return
    }

    for (let i = 0; i < missions.length; i++) {
        if (missions[i].id === varId) {
            missions[i].title = oggettoModificato.title ? oggettoModificato.title : missions[i].title
            missions[i].description = oggettoModificato.description ? oggettoModificato.description : missions[i].description
            missions[i].category = oggettoModificato.category ? oggettoModificato.category : missions[i].category
            missions[i].difficulty = oggettoModificato.difficulty ? oggettoModificato.difficulty : missions[i].difficulty
            missions[i].estimatedMinutes = oggettoModificato.estimatedMinutes ? oggettoModificato.estimatedMinutes : missions[i].estimatedMinutes
            missions[i].status = oggettoModificato.status ? oggettoModificato.status : missions[i].status
            missions[i].score = oggettoModificato.score ? oggettoModificato.score : missions[i].score
            missions[i].requiredTools = oggettoModificato.requiredTools ? oggettoModificato.requiredTools : missions[i].requiredTools
            missions[i].solution = oggettoModificato.solution ? oggettoModificato.solution : missions[i].solution
            missions[i].updatedAt = Date.now()
        }
    }
})

app.patch("/api/missions/:id/activate", (req, res) => {
    if (req.params.id.trim() == "") {
        res.status(400).json({ message: "Attenzioooooone, campo obbligatorio" })
        return
    }

    const varId = parseInt(req.params.id)

    for (let i = 0; i < missions.length; i++) {
        if (missions[i].id === varId) {
            
            if(missions[i].status == "DRAFT"){
                missions[i].status = "ACTIVE"
                missions[i].updatedAt = Date.now()

                res.status(200).json({ message: "Stappoooooo" })
                return
            }
            else{
                res.status(400).json({ message: "Attenzioooooone, non in DRAFT" })
                return
            }

        }
    }

    res.status(404).json({ message: "Errore, non trovato" })
})