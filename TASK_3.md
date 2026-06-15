# Traccia: REST API per la gestione di Sale Fitness e Prenotazioni Lezioni

Realizzare una REST API per la gestione delle **sale di una palestra** e delle relative **prenotazioni per lezioni fitness**.

Il sistema deve permettere di gestire le sale disponibili all’interno della palestra e consentire agli utenti di prenotare una lezione in una determinata fascia oraria.

L’obiettivo è creare una API REST con **una entità principale** e **una entità secondaria collegata**, introducendo CRUD complete, endpoint di ciclo di vita, filtri, ricerca, statistiche e regole di business.

---

# Entità principale: FitnessRoom

Una sala rappresenta uno spazio utilizzabile per svolgere lezioni o attività fitness.

## Campi suggeriti

```text
id
name
description
zone
type
status
capacity
hourlyCost
hasAudioSystem
hasMirrors
createdAt
updatedAt
archivedAt
```

## Esempi di `zone`

```text
GROUND_FLOOR
FIRST_FLOOR
CARDIO_AREA
WEIGHT_AREA
RELAX_AREA
```

## Esempi di `type`

```text
YOGA_ROOM
SPINNING_ROOM
FUNCTIONAL_ROOM
PILATES_ROOM
BOXING_ROOM
DANCE_ROOM
```

## Esempi di `status`

```text
AVAILABLE
UNAVAILABLE
MAINTENANCE
ARCHIVED
```

---

# Entità secondaria: ClassBooking

Una prenotazione rappresenta l’assegnazione di una sala a una lezione fitness in una determinata fascia oraria.

## Campi suggeriti

```text
id
fitnessRoomId
className
instructorName
instructorEmail
startTime
endTime
status
participants
totalCost
notes
createdAt
updatedAt
cancelledAt
startedAt
completedAt
```

## Esempi di `status`

```text
PLANNED
CONFIRMED
CANCELLED
IN_PROGRESS
COMPLETED
NO_SHOW
```

---

# CRUD richieste per FitnessRoom

Implementare gli endpoint per gestire le sale fitness.

```http
POST   /api/fitness-rooms
GET    /api/fitness-rooms
GET    /api/fitness-rooms/{id}
PUT    /api/fitness-rooms/{id}
DELETE /api/fitness-rooms/{id}
```

La API deve permettere di:

* creare una nuova sala;
* visualizzare tutte le sale;
* visualizzare il dettaglio di una sala;
* modificare una sala esistente;
* eliminare definitivamente una sala.

---

# CRUD richieste per ClassBooking

Implementare gli endpoint per gestire le prenotazioni delle lezioni associate a una sala.

```http
POST   /api/fitness-rooms/{roomId}/bookings
GET    /api/fitness-rooms/{roomId}/bookings
GET    /api/fitness-rooms/{roomId}/bookings/{bookingId}
PUT    /api/fitness-rooms/{roomId}/bookings/{bookingId}
DELETE /api/fitness-rooms/{roomId}/bookings/{bookingId}
```

La API deve permettere di:

* creare una prenotazione per una lezione;
* visualizzare tutte le prenotazioni di una sala;
* visualizzare il dettaglio di una prenotazione;
* modificare una prenotazione;
* eliminare definitivamente una prenotazione.

---

# Endpoint particolari sulle sale

## Rendere una sala disponibile

```http
PATCH /api/fitness-rooms/{id}/available
```

## Regole

* Solo una sala in stato `UNAVAILABLE` o `MAINTENANCE` può tornare disponibile.
* Una sala archiviata non può tornare disponibile.
* Lo stato diventa `AVAILABLE`.

---

## Rendere una sala non disponibile

```http
PATCH /api/fitness-rooms/{id}/unavailable
```

## Regole

* Solo una sala in stato `AVAILABLE` può essere resa non disponibile.
* Una sala non disponibile non può ricevere nuove prenotazioni.
* Le lezioni già confermate rimangono valide.

---

## Mandare una sala in manutenzione

```http
PATCH /api/fitness-rooms/{id}/maintenance
```

## Regole

* Una sala archiviata non può andare in manutenzione.
* Una sala in manutenzione non può ricevere nuove prenotazioni.
* Non è possibile mandare in manutenzione una sala se esistono lezioni confermate future.
* Lo stato diventa `MAINTENANCE`.

---

## Archiviare una sala

```http
PATCH /api/fitness-rooms/{id}/archive
```

## Regole

* Una sala archiviata non deve comparire nella lista principale delle sale attive.
* Una sala archiviata non può ricevere prenotazioni.
* Una sala archiviata non può essere modificata.
* Lo stato diventa `ARCHIVED`.
* Il campo `archivedAt` viene valorizzato.

---

# Endpoint particolari sulle prenotazioni

## Confermare una lezione

```http
PATCH /api/fitness-rooms/{roomId}/bookings/{bookingId}/confirm
```

## Regole

* Solo una prenotazione in stato `PLANNED` può essere confermata.
* La sala deve essere in stato `AVAILABLE`.
* Non devono esistere altre lezioni confermate nella stessa fascia oraria.
* Il numero di partecipanti non può superare la capacità massima della sala.
* Lo stato diventa `CONFIRMED`.

---

## Cancellare una lezione

```http
PATCH /api/fitness-rooms/{roomId}/bookings/{bookingId}/cancel
```

## Regole

* Una lezione `COMPLETED` non può essere cancellata.
* Una lezione `CANCELLED` non può essere cancellata di nuovo.
* Una lezione `IN_PROGRESS` non può essere cancellata.
* Il campo `cancelledAt` viene valorizzato.
* Lo stato diventa `CANCELLED`.

---

## Avviare una lezione

```http
PATCH /api/fitness-rooms/{roomId}/bookings/{bookingId}/start
```

## Regole

* Solo una lezione `CONFIRMED` può essere avviata.
* La sala deve essere ancora disponibile.
* La lezione può essere avviata solo nel giorno previsto.
* Lo stato diventa `IN_PROGRESS`.
* Il campo `startedAt` viene valorizzato.

---

## Completare una lezione

```http
PATCH /api/fitness-rooms/{roomId}/bookings/{bookingId}/complete
```

## Regole

* Solo una lezione in stato `IN_PROGRESS` può essere completata.
* Lo stato diventa `COMPLETED`.
* Il campo `completedAt` viene valorizzato.

---

## Segnalare una lezione come no-show

```http
PATCH /api/fitness-rooms/{roomId}/bookings/{bookingId}/no-show
```

## Regole

* Solo una lezione `CONFIRMED` può diventare `NO_SHOW`.
* Può essere segnata come `NO_SHOW` solo dopo l’orario di inizio previsto.
* Una lezione `NO_SHOW` non può essere modificata liberamente.

---

# Endpoint di filtro e ricerca

## Ottenere sale per zona

```http
GET /api/fitness-rooms/zone/{zone}
```

Esempio:

```http
GET /api/fitness-rooms/zone/FIRST_FLOOR
```

---

## Ottenere sale per tipo

```http
GET /api/fitness-rooms/type/{type}
```

Esempio:

```http
GET /api/fitness-rooms/type/YOGA_ROOM
```

---

## Ottenere sale per stato

```http
GET /api/fitness-rooms/status/{status}
```

Esempio:

```http
GET /api/fitness-rooms/status/AVAILABLE
```

---

## Cercare sale per parola chiave

Endpoint per cercare sale nel nome o nella descrizione.

```http
GET /api/fitness-rooms/search?keyword=yoga
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword può essere cercata nel nome e nella descrizione.
* Se non viene trovata alcuna sala, restituire una lista vuota.

---

## Verificare disponibilità di una sala

```http
GET /api/fitness-rooms/{id}/availability?startTime=2026-07-01T09:00:00&endTime=2026-07-01T10:30:00
```

## Regole

* La sala deve esistere.
* La sala deve essere in stato `AVAILABLE`.
* `startTime` deve essere precedente a `endTime`.
* Se esiste una prenotazione `CONFIRMED` o `IN_PROGRESS` nello stesso intervallo, la sala non è disponibile.

## Risposta attesa di esempio

```json
{
  "fitnessRoomId": 1,
  "available": true,
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T10:30:00"
}
```

---

## Cercare sale disponibili in una fascia oraria

```http
GET /api/fitness-rooms/available?startTime=2026-07-01T09:00:00&endTime=2026-07-01T10:30:00
```

## Regole

* Restituire solo sale in stato `AVAILABLE`.
* Escludere le sale con lezioni `CONFIRMED` o `IN_PROGRESS` sovrapposte.
* Restituire lista vuota se nessuna sala è disponibile.

---

## Ottenere lezioni future di una sala

```http
GET /api/fitness-rooms/{roomId}/bookings/upcoming
```

## Regole

* Restituire solo lezioni con `startTime` futuro.
* Escludere prenotazioni `CANCELLED`, `COMPLETED` e `NO_SHOW`.

---

# Endpoint statistiche

## Ottenere il riepilogo generale delle sale

```http
GET /api/fitness-rooms/stats
```

## Risposta attesa di esempio

```json
{
  "totalRooms": 12,
  "availableRooms": 7,
  "unavailableRooms": 2,
  "maintenanceRooms": 2,
  "archivedRooms": 1,
  "averageCapacity": 18.5,
  "averageHourlyCost": 35.00
}
```

---

## Ottenere il riepilogo delle prenotazioni

```http
GET /api/class-bookings/stats
```

## Risposta attesa di esempio

```json
{
  "totalBookings": 80,
  "plannedBookings": 12,
  "confirmedBookings": 25,
  "cancelledBookings": 10,
  "inProgressBookings": 3,
  "completedBookings": 26,
  "noShowBookings": 4,
  "totalRevenue": 3200.00
}
```

---

## Ottenere il riepilogo di una singola sala

```http
GET /api/fitness-rooms/{id}/stats
```

## Risposta attesa di esempio

```json
{
  "fitnessRoomId": 1,
  "roomName": "Sala Yoga Luna",
  "totalBookings": 24,
  "confirmedBookings": 5,
  "completedBookings": 15,
  "cancelledBookings": 2,
  "noShowBookings": 2,
  "totalRevenue": 780.00
}
```

---

# Regole di business generali

* Il nome della sala è obbligatorio.
* La zona della sala è obbligatoria.
* Il tipo della sala è obbligatorio.
* La capacità deve essere maggiore di 0.
* Il costo orario deve essere maggiore o uguale a 0.
* Una sala archiviata non può essere modificata.
* Una sala archiviata non può ricevere prenotazioni.
* Una sala in manutenzione non può ricevere prenotazioni.
* Una sala non disponibile non può ricevere nuove prenotazioni.
* Una prenotazione deve sempre appartenere a una sala esistente.
* `startTime` deve essere precedente a `endTime`.
* Non possono esistere due lezioni confermate sovrapposte per la stessa sala.
* Il numero di partecipanti non può superare la capacità della sala.
* Una lezione completata non può essere modificata liberamente.
* Una lezione cancellata non può tornare direttamente confermata.
* Una prenotazione eliminata viene rimossa definitivamente.
* Una prenotazione cancellata rimane nello storico.
* Il `totalCost` viene calcolato automaticamente in base alla durata della lezione e al costo orario della sala.

---

# Possibili DTO richiesti

## FitnessRoomCreateRequest

```json
{
  "name": "Sala Yoga Luna",
  "description": "Sala silenziosa con tappetini, specchi e impianto audio.",
  "zone": "FIRST_FLOOR",
  "type": "YOGA_ROOM",
  "capacity": 20,
  "hourlyCost": 35.00,
  "hasAudioSystem": true,
  "hasMirrors": true
}
```

---

## ClassBookingCreateRequest

```json
{
  "className": "Yoga Flow Base",
  "instructorName": "Laura Bianchi",
  "instructorEmail": "laura.bianchi@example.com",
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T10:30:00",
  "participants": 15,
  "notes": "Lezione adatta ai principianti."
}
```

---

## FitnessRoomResponse

```json
{
  "id": 1,
  "name": "Sala Yoga Luna",
  "description": "Sala silenziosa con tappetini, specchi e impianto audio.",
  "zone": "FIRST_FLOOR",
  "type": "YOGA_ROOM",
  "status": "AVAILABLE",
  "capacity": 20,
  "hourlyCost": 35.00,
  "hasAudioSystem": true,
  "hasMirrors": true,
  "createdAt": "2026-06-15T09:30:00",
  "updatedAt": null,
  "archivedAt": null
}
```

---

## ClassBookingResponse

```json
{
  "id": 1,
  "fitnessRoomId": 1,
  "className": "Yoga Flow Base",
  "instructorName": "Laura Bianchi",
  "instructorEmail": "laura.bianchi@example.com",
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T10:30:00",
  "status": "PLANNED",
  "participants": 15,
  "totalCost": 52.50,
  "notes": "Lezione adatta ai principianti.",
  "createdAt": "2026-06-15T09:30:00",
  "updatedAt": null,
  "cancelledAt": null,
  "startedAt": null,
  "completedAt": null
}
```

---

# Gestione errori consigliata

La API dovrebbe restituire errori coerenti.

```http
400 Bad Request
```

Quando i dati inviati non rispettano le validazioni.

```http
404 Not Found
```

Quando la sala o la prenotazione richiesta non esiste.

```http
409 Conflict
```

Quando l’operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "ROOM_BOOKING_OVERLAP",
  "message": "Esiste già una lezione confermata per questa sala nella fascia oraria indicata."
}
```

Altro esempio:

```json
{
  "error": "ROOM_CAPACITY_EXCEEDED",
  "message": "Il numero di partecipanti supera la capacità massima della sala."
}
```

---

# Livello di difficoltà richiesto

La traccia è pensata per uno studente che abbia già visto:

* CRUD REST;
* DTO di request e response;
* validazioni;
* enum;
* relazioni uno-a-molti;
* endpoint `PATCH`;
* filtri con path variable;
* query param;
* gestione delle date;
* controllo di sovrapposizione tra intervalli temporali;
* logica di business nello strato service;
* gestione degli errori HTTP;
* calcolo automatico di costi;
* statistiche aggregate.
