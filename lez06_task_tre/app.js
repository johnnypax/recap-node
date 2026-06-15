//Giovanni Pace
const express = require('express')
const app = express()

app.use(express.json())

const PORT = 3000
const HOST = 'localhost'

app.listen(PORT, HOST, () => {
    console.log("Sono connesso!")
})

const zoneTypes = {
    GROUND_FLOOR: "GROUND_FLOOR",
    FIRST_FLOOR: "FIRST_FLOOR",
    CARDIO_AREA: "CARDIO_AREA",
    WEIGHT_AREA: "WEIGHT_AREA",
    RELAX_AREA: "RELAX_AREA"
}

const typeTypes = {
    YOGA_ROOM: "YOGA_ROOM",
    SPINNING_ROOM: "SPINNING_ROOM",
    FUNCTIONAL_ROOM: "FUNCTIONAL_ROOM",
    PILATES_ROOM: "PILATES_ROOM",
    BOXING_ROOM: "BOXING_ROOM",
    DANCE_ROOM: "DANCE_ROOM"
}

let statusTypes = {
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    MAINTENANCE: "MAINTENANCE",
    ARCHIVED: "ARCHIVED"
}

let statusBookingTypes = {
    PLANNED: "PLANNED",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    NO_SHOW: "NO_SHOW",
}

let fitnetRooms = [
    {
        id: 1,
        name: "Total Body",
        description: "Prova",
        zone: zoneTypes.FIRST_FLOOR,
        type: typeTypes.DANCE_ROOM,
        status: statusTypes.ARCHIVED,
        capacity: 8,
        hourlyCost: 12.5,
        hasAudioSystem: true,
        hasMirrors: true,
        createdAt: new Date("2026-01-01"),
        updatedAt: null,
        archivedAt: null
    }
]

let classBookings = [
    {
        id: 1,
        fitnessRoomId: 1,
        className: "Avanzato primo",
        instructorName: "Giovanni Pace",
        instructorEmail: "prova@prova.com",
        startTime: "11:00", //Riutilizzo lo stesso elemento per tutte le settimane
        endTime: "12:00",
        status: statusBookingTypes.CONFIRMED,
        participants: 50,
        totalCost: 200,
        notes: "",
        createdAt: Date.now(),
        updatedAt: null,
        cancelledAt: null,
        startedAt: null,
        completedAt: null,
    }
]

let lastId = 1

app.get("/api/fitness-rooms", (req, res) => {
    res.json(fitnetRooms);
})

app.post("/api/fitness-rooms",  (req, res) => {
    const newFitness = req.body;
    
    if(
        !newFitness.name || newFitness.name.trim() == "" ||
        !(newFitness.zone in zoneTypes) ||
        !(newFitness.type in typeTypes) ||
        !(newFitness.status in statusTypes)
    ){
        res.status(400).json({message: "Errore di validazione"})
    }

    newFitness.id = lastId + 1
    fitnetRooms.push(newFitness)
    lastId++
    
    res.status(201).json(newFitness)
})

app.patch("/api/fitness-rooms/:id/available", (req, res) => {

    if(!req.params.id || req.params.id.trim() == "")
        return res.status(400).json({message: "Errore di validazione"})

    let varId = parseInt(req.params.id);
    for(let i=0; i<fitnetRooms.length; i++){
        if(fitnetRooms[i].id === varId){
            
            if(fitnetRooms[i].status === statusTypes.UNAVAILABLE || fitnetRooms[i].status === statusTypes.MAINTENANCE)
            {
                fitnetRooms[i].status = statusTypes.AVAILABLE
                fitnetRooms[i].updatedAt = Date.now()
                return res.json({message: "Aggiornato"})
            }
            else{
               return res.status(400).json({message: "Errore: Non modificabile"}) 
            }

        }
    }

    return res.status(404).json({message: "Errore: Non trovato"})

})