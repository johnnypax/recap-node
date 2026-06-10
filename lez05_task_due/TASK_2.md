# Traccia: REST API per la gestione di Spazi Coworking e Prenotazioni

Realizzare una REST API per la gestione di **postazioni di coworking** e delle relative **prenotazioni**.

Il sistema deve permettere di gestire le postazioni disponibili in uno spazio di coworking e consentire agli utenti di prenotarle in determinate fasce orarie.

L’obiettivo è creare una API REST con **una entità principale** e **una entità secondaria collegata**, introducendo CRUD complete, endpoint di ciclo di vita, filtri, ricerca, statistiche e regole di business.

---

# Entità principale: Workspace

Una postazione rappresenta uno spazio prenotabile all’interno del coworking.

## Campi suggeriti

```text
id
name
description
area
type
status
hourlyPrice
capacity
hasMonitor
hasDockingStation
createdAt
updatedAt
archivedAt
```

## Esempi di `area`

```text
OPEN_SPACE
PRIVATE_ROOM
MEETING_AREA
SILENT_AREA
TRAINING_ROOM
```

## Esempi di `type`

```text
DESK
PRIVATE_OFFICE
MEETING_ROOM
LAB_ROOM
PHONE_BOOTH
```

## Esempi di `status`

```text
AVAILABLE
UNAVAILABLE
MAINTENANCE
ARCHIVED
```

---

# Entità secondaria: Booking

Una prenotazione rappresenta l’assegnazione di una postazione a un utente in una determinata fascia oraria.

## Campi suggeriti

```text
id
workspaceId
customerName
customerEmail
startTime
endTime
status
totalPrice
notes
createdAt
updatedAt
cancelledAt
checkedInAt
checkedOutAt
```

## Esempi di `status`

```text
PENDING
CONFIRMED
CANCELLED
CHECKED_IN
COMPLETED
NO_SHOW
```

---

# CRUD richieste per Workspace

Implementare gli endpoint per gestire le postazioni.

```http
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/{id}
PUT    /api/workspaces/{id}
DELETE /api/workspaces/{id}
```

La API deve permettere di:

* creare una nuova postazione;
* visualizzare tutte le postazioni;
* visualizzare il dettaglio di una postazione;
* modificare una postazione esistente;
* eliminare definitivamente una postazione.

---

# CRUD richieste per Booking

Implementare gli endpoint per gestire le prenotazioni di una postazione.

```http
POST   /api/workspaces/{workspaceId}/bookings
GET    /api/workspaces/{workspaceId}/bookings
GET    /api/workspaces/{workspaceId}/bookings/{bookingId}
PUT    /api/workspaces/{workspaceId}/bookings/{bookingId}
DELETE /api/workspaces/{workspaceId}/bookings/{bookingId}
```

La API deve permettere di:

* creare una prenotazione per una postazione;
* visualizzare tutte le prenotazioni di una postazione;
* visualizzare il dettaglio di una prenotazione;
* modificare una prenotazione;
* eliminare definitivamente una prenotazione.

---

# Endpoint particolari sulle postazioni

## Rendere una postazione disponibile

```http
PATCH /api/workspaces/{id}/available
```

## Regole

* Solo una postazione in stato `UNAVAILABLE` o `MAINTENANCE` può tornare disponibile.
* Una postazione archiviata non può tornare disponibile.
* Lo stato diventa `AVAILABLE`.

---

## Rendere una postazione non disponibile

```http
PATCH /api/workspaces/{id}/unavailable
```

## Regole

* Solo una postazione in stato `AVAILABLE` può essere resa non disponibile.
* Una postazione non disponibile non può ricevere nuove prenotazioni.
* Le prenotazioni già confermate rimangono valide.

---

## Mandare una postazione in manutenzione

```http
PATCH /api/workspaces/{id}/maintenance
```

## Regole

* Una postazione archiviata non può andare in manutenzione.
* Una postazione in manutenzione non può ricevere nuove prenotazioni.
* Non è possibile mandare in manutenzione una postazione se ci sono prenotazioni confermate future.
* Lo stato diventa `MAINTENANCE`.

---

## Archiviare una postazione

```http
PATCH /api/workspaces/{id}/archive
```

## Regole

* Una postazione archiviata non deve comparire nella lista principale delle postazioni disponibili.
* Una postazione archiviata non può essere prenotata.
* Una postazione archiviata non può essere modificata.
* Lo stato diventa `ARCHIVED`.
* Il campo `archivedAt` viene valorizzato.

---

# Endpoint particolari sulle prenotazioni

## Confermare una prenotazione

```http
PATCH /api/workspaces/{workspaceId}/bookings/{bookingId}/confirm
```

## Regole

* Solo una prenotazione in stato `PENDING` può essere confermata.
* La postazione deve essere in stato `AVAILABLE`.
* Non devono esistere altre prenotazioni confermate nello stesso intervallo temporale.
* Lo stato della prenotazione diventa `CONFIRMED`.

---

## Cancellare una prenotazione

```http
PATCH /api/workspaces/{workspaceId}/bookings/{bookingId}/cancel
```

## Regole

* Una prenotazione `COMPLETED` non può essere cancellata.
* Una prenotazione `CANCELLED` non può essere cancellata di nuovo.
* Il campo `cancelledAt` viene valorizzato.
* Lo stato diventa `CANCELLED`.

---

## Effettuare il check-in

```http
PATCH /api/workspaces/{workspaceId}/bookings/{bookingId}/check-in
```

## Regole

* Solo una prenotazione `CONFIRMED` può effettuare il check-in.
* La postazione deve essere ancora disponibile.
* Il check-in può essere effettuato solo nel giorno della prenotazione.
* Lo stato diventa `CHECKED_IN`.
* Il campo `checkedInAt` viene valorizzato.

---

## Effettuare il check-out

```http
PATCH /api/workspaces/{workspaceId}/bookings/{bookingId}/check-out
```

## Regole

* Solo una prenotazione in stato `CHECKED_IN` può effettuare il check-out.
* Lo stato diventa `COMPLETED`.
* Il campo `checkedOutAt` viene valorizzato.

---

## Segnalare una prenotazione come no-show

```http
PATCH /api/workspaces/{workspaceId}/bookings/{bookingId}/no-show
```

## Regole

* Solo una prenotazione `CONFIRMED` può diventare `NO_SHOW`.
* Può essere segnata come `NO_SHOW` solo dopo l’orario di inizio prenotazione.
* Una prenotazione `NO_SHOW` non può essere modificata liberamente.

---

# Endpoint di filtro e ricerca

## Ottenere postazioni per area

```http
GET /api/workspaces/area/{area}
```

Esempio:

```http
GET /api/workspaces/area/OPEN_SPACE
```

---

## Ottenere postazioni per tipo

```http
GET /api/workspaces/type/{type}
```

Esempio:

```http
GET /api/workspaces/type/MEETING_ROOM
```

---

## Ottenere postazioni per stato

```http
GET /api/workspaces/status/{status}
```

Esempio:

```http
GET /api/workspaces/status/AVAILABLE
```

---

## Cercare postazioni per parola chiave

Endpoint per cercare postazioni nel nome o nella descrizione.

```http
GET /api/workspaces/search?keyword=silenziosa
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword può essere cercata nel nome e nella descrizione.
* Se non viene trovata alcuna postazione, restituire una lista vuota.

---

## Verificare disponibilità di una postazione

```http
GET /api/workspaces/{id}/availability?startTime=2026-07-01T09:00:00&endTime=2026-07-01T13:00:00
```

## Regole

* La postazione deve esistere.
* La postazione deve essere in stato `AVAILABLE`.
* `startTime` deve essere precedente a `endTime`.
* Se esiste una prenotazione `CONFIRMED` o `CHECKED_IN` nello stesso intervallo, la postazione non è disponibile.

## Risposta attesa di esempio

```json
{
  "workspaceId": 1,
  "available": true,
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T13:00:00"
}
```

---

## Cercare postazioni disponibili in una fascia oraria

```http
GET /api/workspaces/available?startTime=2026-07-01T09:00:00&endTime=2026-07-01T13:00:00
```

## Regole

* Restituire solo postazioni in stato `AVAILABLE`.
* Escludere le postazioni con prenotazioni `CONFIRMED` o `CHECKED_IN` sovrapposte.
* Restituire lista vuota se nessuna postazione è disponibile.

---

## Ottenere prenotazioni future di una postazione

```http
GET /api/workspaces/{workspaceId}/bookings/upcoming
```

## Regole

* Restituire solo prenotazioni con `startTime` futuro.
* Escludere prenotazioni `CANCELLED`, `COMPLETED` e `NO_SHOW`.

---

# Endpoint statistiche

## Ottenere il riepilogo generale delle postazioni

```http
GET /api/workspaces/stats
```

## Risposta attesa di esempio

```json
{
  "totalWorkspaces": 25,
  "availableWorkspaces": 16,
  "unavailableWorkspaces": 3,
  "maintenanceWorkspaces": 4,
  "archivedWorkspaces": 2,
  "averageHourlyPrice": 18.5
}
```

---

## Ottenere il riepilogo delle prenotazioni

```http
GET /api/bookings/stats
```

## Risposta attesa di esempio

```json
{
  "totalBookings": 120,
  "pendingBookings": 15,
  "confirmedBookings": 40,
  "cancelledBookings": 20,
  "completedBookings": 35,
  "noShowBookings": 10,
  "totalRevenue": 2450.00
}
```

---

## Ottenere il riepilogo di una singola postazione

```http
GET /api/workspaces/{id}/stats
```

## Risposta attesa di esempio

```json
{
  "workspaceId": 1,
  "workspaceName": "Desk Open Space A1",
  "totalBookings": 18,
  "confirmedBookings": 4,
  "completedBookings": 10,
  "cancelledBookings": 2,
  "noShowBookings": 2,
  "totalRevenue": 320.00
}
```

---

# Regole di business generali

* Il nome della postazione è obbligatorio.
* L’area della postazione è obbligatoria.
* Il tipo della postazione è obbligatorio.
* Il prezzo orario deve essere maggiore o uguale a 0.
* La capacità deve essere maggiore di 0.
* Una postazione archiviata non può essere modificata.
* Una postazione archiviata non può ricevere prenotazioni.
* Una postazione in manutenzione non può ricevere prenotazioni.
* Una prenotazione deve sempre appartenere a una postazione esistente.
* `startTime` deve essere precedente a `endTime`.
* Non possono esistere due prenotazioni confermate sovrapposte per la stessa postazione.
* Una prenotazione completata non può essere modificata liberamente.
* Una prenotazione cancellata non può tornare direttamente confermata.
* Una prenotazione eliminata viene rimossa definitivamente.
* Una prenotazione cancellata rimane nello storico.
* Il `totalPrice` viene calcolato automaticamente in base alla durata della prenotazione e al prezzo orario della postazione.

---

# Possibili DTO richiesti

## WorkspaceCreateRequest

```json
{
  "name": "Desk Open Space A1",
  "description": "Postazione singola in open space con monitor esterno e docking station.",
  "area": "OPEN_SPACE",
  "type": "DESK",
  "hourlyPrice": 12.50,
  "capacity": 1,
  "hasMonitor": true,
  "hasDockingStation": true
}
```

## BookingCreateRequest

```json
{
  "customerName": "Mario Rossi",
  "customerEmail": "mario.rossi@example.com",
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T13:00:00",
  "notes": "Richiesta postazione vicino alla finestra."
}
```

## WorkspaceResponse

```json
{
  "id": 1,
  "name": "Desk Open Space A1",
  "description": "Postazione singola in open space con monitor esterno e docking station.",
  "area": "OPEN_SPACE",
  "type": "DESK",
  "status": "AVAILABLE",
  "hourlyPrice": 12.50,
  "capacity": 1,
  "hasMonitor": true,
  "hasDockingStation": true,
  "createdAt": "2026-06-10T10:30:00",
  "updatedAt": null,
  "archivedAt": null
}
```

## BookingResponse

```json
{
  "id": 1,
  "workspaceId": 1,
  "customerName": "Mario Rossi",
  "customerEmail": "mario.rossi@example.com",
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T13:00:00",
  "status": "PENDING",
  "totalPrice": 50.00,
  "notes": "Richiesta postazione vicino alla finestra.",
  "createdAt": "2026-06-10T10:30:00",
  "updatedAt": null,
  "cancelledAt": null,
  "checkedInAt": null,
  "checkedOutAt": null
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

Quando la postazione o la prenotazione richiesta non esiste.

```http
409 Conflict
```

Quando l’operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "BOOKING_OVERLAP",
  "message": "Esiste già una prenotazione confermata per questa postazione nella fascia oraria indicata."
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
* gestione degli errori HTTP.
