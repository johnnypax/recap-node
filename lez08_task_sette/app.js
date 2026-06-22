//Giovanni Pace
const express = require('express')
const app = express()

app.use(express.json())

const PORT = 3001
const HOST = 'localhost'

app.listen(PORT, HOST, () => {
    console.log("Sono connesso!")
})

const statusTypes = {
    RECEIVED: "RECEIVED",
    IN_PROGRESS: "IN_PROGRESS",
    WAITING_PARTS: "WAITING_PARTS",
    REPAIRED: "REPAIRED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
}

let list = [
    {
        id: 1,
        customerName: "Giovanni",
        deviceDescription: "Smartphone",
        problemDescription: "Non si accende",
        status: statusTypes.IN_PROGRESS
    },
    {
        id: 2,
        customerName: "Maria Rossi",
        deviceDescription: "Notebook HP",
        problemDescription: "Schermo nero all'avvio",
        status: statusTypes.RECEIVED
    },
    {
        id: 3,
        customerName: "Luca Bianchi",
        deviceDescription: "Tablet Samsung",
        problemDescription: "Touchscreen non risponde",
        status: statusTypes.WAITING_PARTS
    },
    {
        id: 4,
        customerName: "Anna Verdi",
        deviceDescription: "iPhone 13",
        problemDescription: "Batteria si scarica rapidamente",
        status: statusTypes.REPAIRED
    },
    {
        id: 5,
        customerName: "Marco Neri",
        deviceDescription: "Console PlayStation 5",
        problemDescription: "Si spegne durante l'utilizzo",
        status: statusTypes.IN_PROGRESS
    },
    {
        id: 6,
        customerName: "Sara Esposito",
        deviceDescription: "Monitor LG",
        problemDescription: "Linee verticali sullo schermo",
        status: statusTypes.DELIVERED
    },
    {
        id: 7,
        customerName: "Paolo Romano",
        deviceDescription: "Stampante Epson",
        problemDescription: "Non stampa correttamente",
        status: statusTypes.CANCELLED
    }
]

function calcolaTotali(varStatus){
    let totale = 0;
    for(let i=0; i<list.length; i++)
        if(list[i].status === varStatus)
            totale++

    return totale
}

app.get("/api/repairs/stats", (req, res) => {
    const received = calcolaTotali(statusTypes.RECEIVED);
    const inProgress = calcolaTotali(statusTypes.IN_PROGRESS);
    const waitingParts = calcolaTotali(statusTypes.WAITING_PARTS);
    const repaired = calcolaTotali(statusTypes.REPAIRED);
    const delivered = calcolaTotali(statusTypes.DELIVERED);
    const cancelled = calcolaTotali(statusTypes.CANCELLED);
    
    const risposta = {
        totalRepairs: list.length,
        receivedRepairs: received,
        inProgressRepairs: inProgress,
        waitingPartsRepairs: waitingParts,
        repairedRepairs: repaired,
        deliveredRepairs: delivered,
        cancelledRepairs: cancelled,
        activeRepairs: received + inProgress + waitingParts + repaired,
    }

    res.json(risposta)
})