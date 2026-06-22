# Domande

1. Illustrare il funzionamento del protocollo HTTP e spiegare la differenza tra metodi GET, POST, PUT, PATCH e DELETE.
2. Spiegare il concetto di API REST, descrivendo risorse, endpoint, codici di stato HTTP e formato JSON.

---

# Traccia: REST API per la gestione delle Riparazioni

Realizzare una REST API per la gestione delle **richieste di riparazione** di dispositivi elettronici.

Il sistema deve permettere di registrare, modificare, prendere in carico, mettere in attesa, completare, consegnare e cancellare una richiesta di riparazione, gestendo stati, filtri, ricerca e statistiche.

L’obiettivo è creare una API REST basata su **una sola entità principale**, con CRUD complete, endpoint di ciclo di vita, filtri, query param, validazioni e regole di business.

---

# Entità principale: RepairRequest

Una richiesta di riparazione rappresenta un dispositivo consegnato da un cliente per essere controllato, riparato e successivamente restituito.

## Campi richiesti

```text
id
customerName
deviceDescription
problemDescription
status
```

## Esempi di `status`

```text
RECEIVED
IN_PROGRESS
WAITING_PARTS
REPAIRED
DELIVERED
CANCELLED
```

Significato degli stati:

```text
RECEIVED       richiesta ricevuta, ma non ancora presa in carico
IN_PROGRESS    riparazione in lavorazione
WAITING_PARTS  riparazione sospesa in attesa di pezzi di ricambio
REPAIRED       dispositivo riparato, ma non ancora consegnato
DELIVERED      dispositivo consegnato al cliente
CANCELLED      richiesta annullata
```

---

# CRUD richieste

Implementare gli endpoint base per gestire le richieste di riparazione.

```http
POST   /api/repairs
GET    /api/repairs
GET    /api/repairs/{id}
PUT    /api/repairs/{id}
DELETE /api/repairs/{id}
```

La API deve permettere di:

* creare una nuova richiesta di riparazione;
* visualizzare tutte le richieste;
* visualizzare il dettaglio di una richiesta;
* modificare una richiesta esistente;
* eliminare definitivamente una richiesta.

---

# Endpoint particolari sul ciclo di vita

## Prendere in carico una riparazione

```http
PATCH /api/repairs/{id}/start
```

## Regole

* Solo una richiesta in stato `RECEIVED` può essere presa in carico.
* Una richiesta `CANCELLED` non può essere presa in carico.
* Una richiesta `DELIVERED` non può essere presa in carico.
* Lo stato diventa `IN_PROGRESS`.

---

## Mettere una riparazione in attesa pezzi

```http
PATCH /api/repairs/{id}/wait-parts
```

## Regole

* Solo una richiesta in stato `IN_PROGRESS` può passare a `WAITING_PARTS`.
* Una richiesta già `REPAIRED` non può tornare in attesa pezzi.
* Una richiesta `DELIVERED` non può essere modificata.
* Lo stato diventa `WAITING_PARTS`.

---

## Riprendere una riparazione in attesa

```http
PATCH /api/repairs/{id}/resume
```

## Regole

* Solo una richiesta in stato `WAITING_PARTS` può essere ripresa.
* Una richiesta `CANCELLED` non può essere ripresa.
* Una richiesta `DELIVERED` non può essere ripresa.
* Lo stato diventa `IN_PROGRESS`.

---

## Segnare una riparazione come completata

```http
PATCH /api/repairs/{id}/complete
```

## Regole

* Solo una richiesta in stato `IN_PROGRESS` può diventare `REPAIRED`.
* Una richiesta in stato `WAITING_PARTS` non può essere completata direttamente.
* Una richiesta `CANCELLED` non può essere completata.
* Una richiesta `DELIVERED` non può essere completata di nuovo.
* Lo stato diventa `REPAIRED`.

---

## Consegnare il dispositivo al cliente

```http
PATCH /api/repairs/{id}/deliver
```

## Regole

* Solo una richiesta in stato `REPAIRED` può essere consegnata.
* Una richiesta `IN_PROGRESS` non può essere consegnata.
* Una richiesta `WAITING_PARTS` non può essere consegnata.
* Una richiesta `CANCELLED` non può essere consegnata.
* Lo stato diventa `DELIVERED`.

---

## Cancellare una richiesta di riparazione

```http
PATCH /api/repairs/{id}/cancel
```

## Regole

* Una richiesta `DELIVERED` non può essere cancellata.
* Una richiesta `REPAIRED` non può essere cancellata se il dispositivo è già pronto.
* Una richiesta `CANCELLED` non può essere cancellata di nuovo.
* Possono essere cancellate solo richieste in stato `RECEIVED`, `IN_PROGRESS` o `WAITING_PARTS`.
* Lo stato diventa `CANCELLED`.

---

# Endpoint di filtro e ricerca

## Ottenere riparazioni per stato

```http
GET /api/repairs/status/{status}
```

Esempio:

```http
GET /api/repairs/status/IN_PROGRESS
```

---

## Cercare riparazioni per cliente

```http
GET /api/repairs/search?customer=rossi
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword deve essere cercata nel campo `customerName`.
* Se non viene trovata alcuna richiesta, restituire una lista vuota.

---

## Cercare riparazioni per dispositivo

```http
GET /api/repairs/search/device?keyword=iphone
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword deve essere cercata nel campo `deviceDescription`.
* Se non viene trovata alcuna richiesta, restituire una lista vuota.

---

## Cercare riparazioni per problema segnalato

```http
GET /api/repairs/search/problem?keyword=batteria
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword deve essere cercata nel campo `problemDescription`.
* Se non viene trovata alcuna richiesta, restituire una lista vuota.

---

## Ottenere le riparazioni attive

```http
GET /api/repairs/active
```

## Regole

Devono essere considerate attive solo le richieste con stato:

```text
RECEIVED
IN_PROGRESS
WAITING_PARTS
REPAIRED
```

Devono essere escluse le richieste con stato:

```text
DELIVERED
CANCELLED
```

---

# Endpoint statistiche

## Riepilogo generale riparazioni

```http
GET /api/repairs/stats
```

## Risposta attesa di esempio

```json
{
  "totalRepairs": 80,
  "receivedRepairs": 10,
  "inProgressRepairs": 18,
  "waitingPartsRepairs": 7,
  "repairedRepairs": 12,
  "deliveredRepairs": 25,
  "cancelledRepairs": 8,
  "activeRepairs": 47
}
```

---

## Riepilogo riparazioni per stato

```http
GET /api/repairs/stats/status/{status}
```

Esempio:

```http
GET /api/repairs/stats/status/WAITING_PARTS
```

## Risposta attesa di esempio

```json
{
  "status": "WAITING_PARTS",
  "total": 7
}
```

---

# Regole di business generali

* Il nome del cliente è obbligatorio.
* La descrizione del dispositivo è obbligatoria.
* La descrizione del problema è obbligatoria.
* Lo stato iniziale di una nuova richiesta deve essere `RECEIVED`.
* Lo stato non può essere scelto liberamente in fase di creazione.
* Una richiesta `DELIVERED` non può essere modificata liberamente.
* Una richiesta `CANCELLED` non può essere modificata liberamente.
* Una richiesta `WAITING_PARTS` non può diventare direttamente `REPAIRED`.
* Una richiesta `RECEIVED` non può diventare direttamente `REPAIRED`.
* Una richiesta `REPAIRED` può passare solo a `DELIVERED`.
* Una richiesta eliminata con `DELETE` viene rimossa definitivamente.
* Una richiesta cancellata con `/cancel` rimane nello storico.

---

# Possibili DTO richiesti

## RepairRequestCreateRequest

```json
{
  "customerName": "Mario Rossi",
  "deviceDescription": "iPhone 13",
  "problemDescription": "Il telefono non si accende"
}
```

---

## RepairRequestUpdateRequest

```json
{
  "customerName": "Mario Rossi",
  "deviceDescription": "iPhone 13 Pro",
  "problemDescription": "Il telefono non si accende e la batteria sembra danneggiata"
}
```

---

## RepairRequestResponse

```json
{
  "id": 1,
  "customerName": "Mario Rossi",
  "deviceDescription": "iPhone 13",
  "problemDescription": "Il telefono non si accende",
  "status": "RECEIVED"
}
```

---

# Gestione errori consigliata

```http
400 Bad Request
```

Quando i dati inviati non rispettano le validazioni.

Esempio:

```json
{
  "error": "INVALID_REPAIR_DATA",
  "message": "Il nome del cliente, il dispositivo e la descrizione del problema sono obbligatori."
}
```

---

```http
404 Not Found
```

Quando la richiesta di riparazione non esiste.

Esempio:

```json
{
  "error": "REPAIR_NOT_FOUND",
  "message": "La richiesta di riparazione indicata non esiste."
}
```

---

```http
409 Conflict
```

Quando l’operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "INVALID_REPAIR_STATUS",
  "message": "Solo una richiesta in stato RECEIVED può essere presa in carico."
}
```

Altro esempio:

```json
{
  "error": "REPAIR_ALREADY_DELIVERED",
  "message": "Una richiesta già consegnata non può essere modificata."
}
```

---

# Requisito importante

L’entità deve contenere **al massimo 5 attributi**.

Pertanto l’unica entità ammessa è:

```text
RepairRequest
```

Con i seguenti campi:

```text
id
customerName
deviceDescription
problemDescription
status
```

Non devono essere aggiunti altri campi come:

```text
createdAt
updatedAt
price
technicianName
customerPhone
priority
completedAt
```

Eventuali informazioni aggiuntive possono essere gestite solo tramite logica applicativa, DTO o risposte statistiche, ma non devono diventare attributi dell’entità principale.
