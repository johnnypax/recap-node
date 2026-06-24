# Domande

1. Che cos’è un’API REST e quali sono le principali caratteristiche che la distinguono da una semplice applicazione web tradizionale?

2. Descrivere il funzionamento di un’architettura software a **2 livelli** e a **3 livelli**, evidenziandone le principali differenze strutturali e funzionali. Fornire, inoltre, esempi pratici di applicazione per ciascuna architettura.

# Traccia: REST API per la gestione dei noleggi di attrezzature fotografiche

Realizzare una REST API per la gestione delle richieste di noleggio di attrezzature fotografiche.

Il sistema deve permettere di registrare, modificare, approvare, consegnare, restituire e annullare una richiesta di noleggio, gestendo stati, filtri, ricerca e statistiche.

L’obiettivo è creare una API REST basata su **una sola entità principale**, con CRUD complete, endpoint di ciclo di vita, filtri, query param, validazioni e regole di business.

---

# Entità principale: EquipmentRental

Un noleggio rappresenta la richiesta di un cliente di utilizzare temporaneamente un’attrezzatura fotografica, come una fotocamera, un obiettivo, un treppiede o un sistema di illuminazione.

## Campi richiesti

```text
id
customerName
equipmentName
rentalPrice
status
```

## Esempi di status

```text
REQUESTED
APPROVED
DELIVERED
RETURNED
CANCELLED
```

## Significato degli stati

```text
REQUESTED   richiesta di noleggio inserita, ma non ancora approvata
APPROVED    richiesta approvata, ma attrezzatura non ancora consegnata
DELIVERED   attrezzatura consegnata al cliente
RETURNED    attrezzatura restituita dal cliente
CANCELLED   richiesta annullata
```

---

# 1. CRUD richieste

Implementare gli endpoint base per gestire i noleggi.

```text
POST   /api/rentals
GET    /api/rentals
GET    /api/rentals/{id}
PUT    /api/rentals/{id}
DELETE /api/rentals/{id}
```

La API deve permettere di:

* creare una nuova richiesta di noleggio;
* visualizzare tutte le richieste di noleggio;
* visualizzare il dettaglio di una richiesta;
* modificare una richiesta esistente;
* eliminare definitivamente una richiesta.

---

# 2. Endpoint avanzati

## 2.a Approvare una richiesta di noleggio

```text
PATCH /api/rentals/{id}/approve
```

## Regole

* Solo una richiesta in stato `REQUESTED` può essere approvata.
* Una richiesta `DELIVERED` non può essere approvata.
* Una richiesta `RETURNED` non può essere approvata.
* Una richiesta `CANCELLED` non può essere approvata.
* Lo stato diventa `APPROVED`.

---

## 2.b Consegnare l’attrezzatura

```text
PATCH /api/rentals/{id}/deliver
```

## Regole

* Solo una richiesta in stato `APPROVED` può passare a consegnata.
* Una richiesta `REQUESTED` non può essere consegnata prima dell’approvazione.
* Una richiesta `RETURNED` non può essere consegnata nuovamente.
* Una richiesta `CANCELLED` non può essere consegnata.
* Lo stato diventa `DELIVERED`.

---

## 2.c Restituire l’attrezzatura

```text
PATCH /api/rentals/{id}/return
```

## Regole

* Solo una richiesta in stato `DELIVERED` può essere restituita.
* Una richiesta `REQUESTED` non può essere restituita.
* Una richiesta `APPROVED` non può essere restituita se l’attrezzatura non è stata consegnata.
* Una richiesta `CANCELLED` non può essere restituita.
* Lo stato diventa `RETURNED`.

---

## 2.d Annullare una richiesta di noleggio

```text
PATCH /api/rentals/{id}/cancel
```

## Regole

* Una richiesta può essere annullata solo se si trova in stato `REQUESTED` o `APPROVED`.
* Una richiesta `DELIVERED` non può essere annullata perché l’attrezzatura è già stata consegnata.
* Una richiesta `RETURNED` non può essere annullata.
* Una richiesta già `CANCELLED` non può essere annullata nuovamente.
* Lo stato diventa `CANCELLED`.

---

# 3. Endpoint di filtro e ricerca

## 3.a Ottenere noleggi per stato

```text
GET /api/rentals/status/{status}
```

Esempio:

```text
GET /api/rentals/status/APPROVED
```

---

## 3.b Cercare noleggi per nome attrezzatura

```text
GET /api/rentals/search?equipment=camera
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword deve essere cercata nel campo `equipmentName`.
* Se non viene trovato alcun noleggio, restituire una lista vuota.

---

## 3.c Cercare noleggi per cliente

```text
GET /api/rentals/search/customer?name=rossi
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword deve essere cercata nel campo `customerName`.
* Se non viene trovato alcun noleggio, restituire una lista vuota.

---

# 4. Endpoint statistiche

## 4.a Riepilogo generale noleggi

```text
GET /api/rentals/stats
```

## Risposta attesa di esempio

```json
{
  "totalRentals": 80,
  "requestedRentals": 15,
  "approvedRentals": 20,
  "deliveredRentals": 18,
  "returnedRentals": 22,
  "cancelledRentals": 5,
  "totalExpectedRevenue": 6400.00,
  "completedRevenue": 2100.00
}
```

## Regole

* `totalRentals` indica il numero totale di richieste presenti nel sistema.
* `requestedRentals` indica il numero di richieste in stato `REQUESTED`.
* `approvedRentals` indica il numero di richieste in stato `APPROVED`.
* `deliveredRentals` indica il numero di richieste in stato `DELIVERED`.
* `returnedRentals` indica il numero di richieste in stato `RETURNED`.
* `cancelledRentals` indica il numero di richieste in stato `CANCELLED`.
* `totalExpectedRevenue` indica la somma degli importi di tutte le richieste non cancellate.
* `completedRevenue` indica la somma degli importi delle richieste in stato `RETURNED`.

---

# Regole di business generali

* Il nome del cliente è obbligatorio.
* Il nome dell’attrezzatura è obbligatorio.
* Il prezzo del noleggio è obbligatorio.
* Il prezzo del noleggio deve essere maggiore di 0.
* Lo stato iniziale di una nuova richiesta deve essere `REQUESTED`.
* Lo stato non può essere scelto liberamente in fase di creazione.
* Una richiesta `RETURNED` non può essere modificata liberamente.
* Una richiesta `CANCELLED` non può essere modificata liberamente.
* Una richiesta `REQUESTED` non può diventare direttamente `DELIVERED`.
* Una richiesta `REQUESTED` non può diventare direttamente `RETURNED`.
* Una richiesta `APPROVED` non può diventare direttamente `RETURNED`.
* Una richiesta `DELIVERED` non può tornare allo stato `APPROVED`.
* Una richiesta eliminata con `DELETE` viene rimossa definitivamente.

---

# Nota sui dati in ingresso e in uscita

Per semplificare la prova, non è richiesto l’utilizzo di DTO.

Gli studenti possono utilizzare direttamente l’entità `EquipmentRental` per ricevere i dati nelle richieste HTTP e restituire le risposte.

Resta comunque obbligatorio rispettare le validazioni e le regole di business previste dalla traccia.

---

# Gestione errori consigliata

* `400 Bad Request`: quando i dati inviati non rispettano le validazioni.
* `404 Not Found`: quando la richiesta di noleggio non esiste.
* `409 Conflict`: quando l’operazione richiesta viola lo stato corrente della risorsa.
