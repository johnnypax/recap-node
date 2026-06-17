//Giovanni Pace
const express = require('express')
const app = express()

app.use(express.json())

const PORT = 3000
const HOST = 'localhost'

app.listen(PORT, HOST, () => {
    console.log("Sono connesso!")
})



const statusTypes = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    SEATED: "SEATED",
    COMPLETED: "COMPLETED",
    NO_SHOW: "NO_SHOW",
}

let lista = [
  {
    id: 1,
    customerName: "Mario Rossi",
    customerEmail: "mario.rossi@email.it",
    customerPhone: "+39 333 1234567",
    reservationDate: "2026-06-20",
    startTime: "20:00",
    endTime: "22:00",
    peopleCount: 4,
    tableNumber: 12,
    status: statusTypes.CONFIRMED,
    specialRequests: "Tavolo vicino alla finestra",
    depositAmount: 20.00,
    totalEstimatedAmount: 120.00,
    createdAt: "2026-06-17T10:30:00",
    updatedAt: null,
    confirmedAt: "2026-06-17T10:35:00",
    cancelledAt: null,
    seatedAt: null,
    completedAt: null,
    noShowAt: null
  },
  {
    id: 2,
    customerName: "Laura Bianchi",
    customerEmail: "laura.bianchi@email.it",
    customerPhone: "+39 347 9876543",
    reservationDate: "2026-06-21",
    startTime: "13:00",
    endTime: "15:00",
    peopleCount: 2,
    tableNumber: 5,
    status: statusTypes.PENDING,
    specialRequests: "Menu vegetariano",
    depositAmount: 0.00,
    totalEstimatedAmount: 60.00,
    createdAt: "2026-06-17T11:15:00",
    updatedAt: null,
    confirmedAt: null,
    cancelledAt: null,
    seatedAt: null,
    completedAt: null,
    noShowAt: null
  },
  {
    id: 3,
    customerName: "Giuseppe Verdi",
    customerEmail: "giuseppe.verdi@email.it",
    customerPhone: "+39 320 4567890",
    reservationDate: "2026-06-22",
    startTime: "21:00",
    endTime: "23:00",
    peopleCount: 6,
    tableNumber: 18,
    status: statusTypes.CANCELLED,
    specialRequests: "Compleanno, portare torta al tavolo",
    depositAmount: 30.00,
    totalEstimatedAmount: 180.00,
    createdAt: "2026-06-16T18:45:00",
    updatedAt: "2026-06-17T09:10:00",
    confirmedAt: "2026-06-16T19:00:00",
    cancelledAt: "2026-06-17T09:10:00",
    seatedAt: null,
    completedAt: null,
    noShowAt: null
  }
];

let lastId = 3;

app.get("/api/reservation", (req, res) => {
    res.json(lista)
})

//5
app.get("/api/reservation/:id", (req, res) => {
    if(!req.params.id || req.params.id.trim() == "" || typeof parseInt(req.params.id) !== 'number'){
        res.status(400).json({message: "Errore richiesta"})
        return;
    }
    let varId = parseInt(req.params.id);

    for(let i=0; i<lista.length; i++){
        if(lista[i].id === varId){
            res.json(lista[i])
            return;
        }
    }

    res.status(404).json({message: "Non trovato"})
})

function validateBody(bodyRequest){
    if(
        !nuovaPren.customerName || nuovaPren.customerName.trim() == "" || typeof nuovaPren.customerName !== 'string' ||
        !nuovaPren.customerEmail || nuovaPren.customerEmail.trim() == "" || typeof nuovaPren.customerEmail !== 'string' ||
        !nuovaPren.customerPhone || nuovaPren.customerPhone.trim() == "" || typeof nuovaPren.customerPhone !== 'string' ||
        !nuovaPren.reservationDate || nuovaPren.reservationDate.trim() == "" || typeof nuovaPren.reservationDate !== 'string' ||
        !nuovaPren.startTime || nuovaPren.startTime.trim() == "" || typeof nuovaPren.startTime !== 'string' ||
        !nuovaPren.endTime || nuovaPren.endTime.trim() == "" || typeof nuovaPren.endTime !== 'string' ||
        !nuovaPren.peopleCount || nuovaPren.peopleCount <= 0 || typeof nuovaPren.peopleCount !== 'number' ||
        !nuovaPren.depositAmount || nuovaPren.depositAmount <= 0 || typeof nuovaPren.depositAmount !== 'number' ||
        !nuovaPren.totalEstimatedAmount || nuovaPren.totalEstimatedAmount.trim() <= 0 ||  typeof nuovaPren.totalEstimatedAmount !== 'number'
    ){
        return false;
    }

    return true;
}

app.post("/api/reservation", (req, res) => {
    let nuovaPren = req.body;

    if(
        validateBody(nuovaPren)
    ){
        res.status(400).json({message: "Errore di validazione"})
    }


    nuovaPren.id = lastId + 1;
    lastId++
    nuovaPren.createdAt = Date.now()
    lista.push(nuovaPren)
});

//1
app.patch("/api/reservations/:id/confirm", (req, res) => {
    //TODO valida ID
    let varId = parseInt(req.params.id);

    for(let i=0; i<lista.length; i++){
        if(lista[i].id === varId){

            for(let j=0; j<lista.length; j++){
                if(
                    lista[j].tableNumber === lista[i].tableNumber && 
                    lista[i].id != lista[j].id && 
                    lista[i].reservationDate === lista[j].reservationDate){
                    res.status(400).json({message: "Errore, già prenotato"})
                    return;
                }   
            }

            if(lista[i].status === statusTypes.PENDING){
                lista[i].status = statusTypes.CONFIRMED
                lista[i].confirmedAt = Date.now()
                res.json({message: "Confermato"})
                return;
            }
            else{
                res.status(400).json({message: "Impossibile confermare"})
                return;
            }
        }
    }

    res.status(404).json({message: "Impossibile trovare"})
})