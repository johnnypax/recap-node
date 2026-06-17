# Domande

1. Illustrare le caratteristiche principali dell'architettura Client-Server
2. Illustrare caratteristiche, pregi e difetti del protocollo TCP e UDP

# Traccia: REST API per la gestione delle Prenotazioni di un Ristorante

Realizzare una REST API per la gestione delle **prenotazioni dei tavoli di un ristorante**.

Il sistema deve permettere di registrare, modificare, confermare, cancellare e completare le prenotazioni dei clienti, gestendo stati, filtri, ricerca, disponibilità e statistiche.

L’obiettivo è creare una API REST basata su **una sola entità principale**, con CRUD complete, endpoint di ciclo di vita, filtri, query param, validazioni e regole di business.

---

# Entità principale: RestaurantReservation

Una prenotazione rappresenta la richiesta di un cliente di riservare un tavolo in una determinata data e fascia oraria.

## Campi suggeriti

```text
id
customerName
customerEmail
customerPhone
reservationDate
startTime
endTime
peopleCount
tableNumber
status
specialRequests
depositAmount
totalEstimatedAmount
createdAt
updatedAt
confirmedAt
cancelledAt
seatedAt
completedAt
noShowAt
```

## Esempi di `status`

```text
PENDING
CONFIRMED
CANCELLED
SEATED
COMPLETED
NO_SHOW
```

---

# CRUD richieste

Implementare gli endpoint base per gestire le prenotazioni.

```http
POST   /api/reservations
GET    /api/reservations
GET    /api/reservations/{id}
PUT    /api/reservations/{id}
DELETE /api/reservations/{id}
```

La API deve permettere di:

* creare una nuova prenotazione;
* visualizzare tutte le prenotazioni;
* visualizzare il dettaglio di una prenotazione;
* modificare una prenotazione esistente;
* eliminare definitivamente una prenotazione.

---

# Endpoint particolari sul ciclo di vita

## Confermare una prenotazione

```http
PATCH /api/reservations/{id}/confirm
```

## Regole

* Solo una prenotazione in stato `PENDING` può essere confermata.
* Non devono esistere altre prenotazioni `CONFIRMED` o `SEATED` per lo stesso tavolo nella stessa fascia oraria.
* Il numero di persone deve essere maggiore di 0.
* Lo stato diventa `CONFIRMED`.
* Il campo `confirmedAt` viene valorizzato.

---

## Cancellare una prenotazione

```http
PATCH /api/reservations/{id}/cancel
```

## Regole

* Una prenotazione `COMPLETED` non può essere cancellata.
* Una prenotazione `CANCELLED` non può essere cancellata di nuovo.
* Una prenotazione `SEATED` non può essere cancellata.
* Lo stato diventa `CANCELLED`.
* Il campo `cancelledAt` viene valorizzato.

---

## Far accomodare il cliente

```http
PATCH /api/reservations/{id}/seat
```

## Regole

* Solo una prenotazione `CONFIRMED` può passare allo stato `SEATED`.
* La prenotazione può essere fatta accomodare solo nel giorno previsto.
* Non è possibile far accomodare una prenotazione già completata, cancellata o segnata come no-show.
* Lo stato diventa `SEATED`.
* Il campo `seatedAt` viene valorizzato.

---

## Completare una prenotazione

```http
PATCH /api/reservations/{id}/complete
```

## Regole

* Solo una prenotazione in stato `SEATED` può essere completata.
* Lo stato diventa `COMPLETED`.
* Il campo `completedAt` viene valorizzato.

---

## Segnalare una prenotazione come no-show

```http
PATCH /api/reservations/{id}/no-show
```

## Regole

* Solo una prenotazione `CONFIRMED` può diventare `NO_SHOW`.
* Può essere segnata come `NO_SHOW` solo dopo l’orario di inizio previsto.
* Una prenotazione `NO_SHOW` non può essere modificata liberamente.
* Il campo `noShowAt` viene valorizzato.

---

# Endpoint di filtro e ricerca

## Ottenere prenotazioni per stato

```http
GET /api/reservations/status/{status}
```

Esempio:

```http
GET /api/reservations/status/CONFIRMED
```

---

## Ottenere prenotazioni per data

```http
GET /api/reservations/date/{reservationDate}
```

Esempio:

```http
GET /api/reservations/date/2026-07-10
```

---

## Ottenere prenotazioni per numero tavolo

```http
GET /api/reservations/table/{tableNumber}
```

Esempio:

```http
GET /api/reservations/table/12
```

---

## Cercare prenotazioni per cliente

```http
GET /api/reservations/search?keyword=rossi
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword può essere cercata in `customerName`, `customerEmail` e `customerPhone`.
* Se non viene trovata alcuna prenotazione, restituire una lista vuota.

---

## Verificare disponibilità di un tavolo

```http
GET /api/reservations/check-availability?tableNumber=5&reservationDate=2026-07-10&startTime=20:00&endTime=22:00
```

## Regole

* `startTime` deve essere precedente a `endTime`.
* Il numero del tavolo deve essere maggiore di 0.
* Se esiste una prenotazione `CONFIRMED` o `SEATED` per lo stesso tavolo nella stessa fascia oraria, il tavolo non è disponibile.
* Le prenotazioni `CANCELLED`, `COMPLETED` e `NO_SHOW` non bloccano il tavolo.

## Risposta attesa di esempio

```json
{
  "tableNumber": 5,
  "reservationDate": "2026-07-10",
  "startTime": "20:00",
  "endTime": "22:00",
  "available": true
}
```

---

## Ottenere le prenotazioni future

```http
GET /api/reservations/upcoming
```

## Regole

* Restituire solo prenotazioni con data futura o con orario non ancora passato.
* Escludere prenotazioni `CANCELLED`, `COMPLETED` e `NO_SHOW`.

---

# Endpoint statistiche

## Riepilogo generale prenotazioni

```http
GET /api/reservations/stats
```

## Risposta attesa di esempio

```json
{
  "totalReservations": 120,
  "pendingReservations": 15,
  "confirmedReservations": 40,
  "cancelledReservations": 18,
  "seatedReservations": 5,
  "completedReservations": 38,
  "noShowReservations": 4,
  "averagePeopleCount": 3.6,
  "totalEstimatedRevenue": 4850.00
}
```

---

## Riepilogo prenotazioni per data

```http
GET /api/reservations/stats/date/2026-07-10
```

## Risposta attesa di esempio

```json
{
  "reservationDate": "2026-07-10",
  "totalReservations": 28,
  "confirmedReservations": 16,
  "completedReservations": 8,
  "cancelledReservations": 3,
  "noShowReservations": 1,
  "totalPeople": 92,
  "estimatedRevenue": 2760.00
}
```

---

# Regole di business generali

* Il nome del cliente è obbligatorio.
* L’email o il numero di telefono devono essere presenti.
* La data della prenotazione è obbligatoria.
* `startTime` deve essere precedente a `endTime`.
* Il numero di persone deve essere maggiore di 0.
* Il numero del tavolo deve essere maggiore di 0.
* Non possono esistere due prenotazioni confermate sovrapposte per lo stesso tavolo.
* Una prenotazione `COMPLETED` non può essere modificata liberamente.
* Una prenotazione `CANCELLED` non può tornare direttamente `CONFIRMED`.
* Una prenotazione `NO_SHOW` non può essere completata.
* Una prenotazione eliminata viene rimossa definitivamente.
* Una prenotazione cancellata rimane nello storico.
* Il campo `totalEstimatedAmount` può essere calcolato automaticamente in base al numero di persone.

---

# Possibili DTO richiesti

## RestaurantReservationCreateRequest

```json
{
  "customerName": "Mario Rossi",
  "customerEmail": "mario.rossi@example.com",
  "customerPhone": "+393331234567",
  "reservationDate": "2026-07-10",
  "startTime": "20:00",
  "endTime": "22:00",
  "peopleCount": 4,
  "tableNumber": 5,
  "specialRequests": "Tavolo vicino alla finestra.",
  "depositAmount": 20.00
}
```

---

## RestaurantReservationResponse

```json
{
  "id": 1,
  "customerName": "Mario Rossi",
  "customerEmail": "mario.rossi@example.com",
  "customerPhone": "+393331234567",
  "reservationDate": "2026-07-10",
  "startTime": "20:00",
  "endTime": "22:00",
  "peopleCount": 4,
  "tableNumber": 5,
  "status": "PENDING",
  "specialRequests": "Tavolo vicino alla finestra.",
  "depositAmount": 20.00,
  "totalEstimatedAmount": 120.00,
  "createdAt": "2026-06-17T10:30:00",
  "updatedAt": null,
  "confirmedAt": null,
  "cancelledAt": null,
  "seatedAt": null,
  "completedAt": null,
  "noShowAt": null
}
```

---

# Gestione errori consigliata

```http
400 Bad Request
```

Quando i dati inviati non rispettano le validazioni.

```http
404 Not Found
```

Quando la prenotazione richiesta non esiste.

```http
409 Conflict
```

Quando l’operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "TABLE_NOT_AVAILABLE",
  "message": "Il tavolo indicato è già prenotato nella fascia oraria selezionata."
}
```

Altro esempio:

```json
{
  "error": "INVALID_RESERVATION_STATUS",
  "message": "Solo una prenotazione in stato PENDING può essere confermata."
}
```

