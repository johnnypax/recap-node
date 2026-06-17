# Domande

1. Illustrare le caratteristiche principali dell’architettura Client-Server.
2. Illustrare il concetto di relazione tra entità in una REST API, distinguendo tra relazione uno-a-molti e molti-a-molti.

------

# Traccia: REST API per la gestione di Immobili e Contratti di Affitto

Realizzare una REST API per la gestione degli **affitti immobiliari**.

Il sistema deve permettere di gestire gli immobili disponibili per l’affitto e i relativi contratti stipulati con gli inquilini.

L’obiettivo è creare una API REST basata su **due entità principali**, con CRUD complete, relazione tra entità, endpoint di ciclo di vita, filtri, query param, validazioni e regole di business.

------

# Entità principali

Il sistema deve gestire le seguenti entità:

```text
RentalProperty
RentalContract
```

La relazione tra le entità è la seguente:

```text
Un immobile può avere più contratti nel tempo.
Un contratto appartiene a un solo immobile.
```

Quindi:

```text
RentalProperty 1 --- N RentalContract
```

------

# Entità 1: RentalProperty

Un immobile rappresenta un appartamento, una casa, un ufficio o un locale disponibile per l’affitto.

## Campi suggeriti

```text
id
title
description
address
city
propertyType
squareMeters
rooms
bathrooms
floor
monthlyRent
depositAmount
status
ownerName
ownerEmail
ownerPhone
createdAt
updatedAt
publishedAt
rentedAt
maintenanceAt
disabledAt
```

## Esempi di `propertyType`

```text
APARTMENT
HOUSE
ROOM
OFFICE
SHOP
GARAGE
```

## Esempi di `status`

```text
DRAFT
AVAILABLE
RESERVED
RENTED
MAINTENANCE
DISABLED
```

------

# Entità 2: RentalContract

Un contratto di affitto rappresenta l’accordo tra il proprietario dell’immobile e l’inquilino.

## Campi suggeriti

```text
id
propertyId
tenantName
tenantEmail
tenantPhone
startDate
endDate
monthlyRent
depositAmount
status
notes
createdAt
updatedAt
signedAt
activatedAt
terminatedAt
cancelledAt
expiredAt
renewedAt
```

## Esempi di `status`

```text
DRAFT
SIGNED
ACTIVE
TERMINATED
CANCELLED
EXPIRED
RENEWED
```

------

# CRUD richieste per RentalProperty

Implementare gli endpoint base per gestire gli immobili.

```http
POST   /api/properties
GET    /api/properties
GET    /api/properties/{id}
PUT    /api/properties/{id}
DELETE /api/properties/{id}
```

La API deve permettere di:

- creare un nuovo immobile;
- visualizzare tutti gli immobili;
- visualizzare il dettaglio di un immobile;
- modificare un immobile esistente;
- eliminare definitivamente un immobile.

------

# CRUD richieste per RentalContract

Implementare gli endpoint base per gestire i contratti di affitto.

```http
POST   /api/contracts
GET    /api/contracts
GET    /api/contracts/{id}
PUT    /api/contracts/{id}
DELETE /api/contracts/{id}
```

La API deve permettere di:

- creare un nuovo contratto;
- visualizzare tutti i contratti;
- visualizzare il dettaglio di un contratto;
- modificare un contratto esistente;
- eliminare definitivamente un contratto.

------

# Endpoint sulla relazione tra entità

## Ottenere tutti i contratti di un immobile

```http
GET /api/properties/{propertyId}/contracts
```

## Regole

- L’immobile deve esistere.
- Se l’immobile non ha contratti, restituire una lista vuota.
- I contratti devono essere ordinati per `startDate` decrescente.

------

## Ottenere il contratto attivo di un immobile

```http
GET /api/properties/{propertyId}/contracts/active
```

## Regole

- L’immobile deve esistere.
- Deve essere restituito solo il contratto con stato `ACTIVE`.
- Se non esiste un contratto attivo, restituire `404 Not Found`.

------

# Endpoint particolari sul ciclo di vita degli immobili

## Pubblicare un immobile

```http
PATCH /api/properties/{id}/publish
```

## Regole

- Solo un immobile in stato `DRAFT` può essere pubblicato.
- Il canone mensile deve essere maggiore di 0.
- L’indirizzo e la città sono obbligatori.
- Lo stato diventa `AVAILABLE`.
- Il campo `publishedAt` viene valorizzato.

------

## Mettere un immobile in manutenzione

```http
PATCH /api/properties/{id}/maintenance
```

## Regole

- Un immobile `RENTED` non può essere messo in manutenzione se ha un contratto `ACTIVE`.
- Un immobile `DISABLED` non può passare direttamente in manutenzione.
- Lo stato diventa `MAINTENANCE`.
- Il campo `maintenanceAt` viene valorizzato.

------

## Rendere nuovamente disponibile un immobile

```http
PATCH /api/properties/{id}/available
```

## Regole

- Solo un immobile in stato `MAINTENANCE`, `RESERVED` o `DRAFT` può tornare disponibile.
- L’immobile non deve avere contratti `ACTIVE`.
- Lo stato diventa `AVAILABLE`.

------

## Disabilitare un immobile

```http
PATCH /api/properties/{id}/disable
```

## Regole

- Un immobile con contratto `ACTIVE` non può essere disabilitato.
- Un immobile già `DISABLED` non può essere disabilitato di nuovo.
- Lo stato diventa `DISABLED`.
- Il campo `disabledAt` viene valorizzato.

------

# Endpoint particolari sul ciclo di vita dei contratti

## Firmare un contratto

```http
PATCH /api/contracts/{id}/sign
```

## Regole

- Solo un contratto in stato `DRAFT` può essere firmato.
- L’immobile collegato deve esistere.
- L’immobile deve essere in stato `AVAILABLE` o `RESERVED`.
- Non devono esistere altri contratti `SIGNED` o `ACTIVE` sovrapposti per lo stesso immobile.
- La data di inizio deve essere precedente alla data di fine.
- Lo stato del contratto diventa `SIGNED`.
- Il campo `signedAt` viene valorizzato.

------

## Attivare un contratto

```http
PATCH /api/contracts/{id}/activate
```

## Regole

- Solo un contratto `SIGNED` può essere attivato.
- Il contratto può essere attivato solo a partire dalla data `startDate`.
- Non devono esistere altri contratti `ACTIVE` per lo stesso immobile.
- Lo stato del contratto diventa `ACTIVE`.
- Lo stato dell’immobile collegato diventa `RENTED`.
- Il campo `activatedAt` viene valorizzato.
- Il campo `rentedAt` dell’immobile viene valorizzato.

------

## Terminare un contratto

```http
PATCH /api/contracts/{id}/terminate
```

## Regole

- Solo un contratto `ACTIVE` può essere terminato.
- Un contratto `CANCELLED` o `EXPIRED` non può essere terminato.
- Lo stato del contratto diventa `TERMINATED`.
- Lo stato dell’immobile collegato diventa `AVAILABLE`.
- Il campo `terminatedAt` viene valorizzato.

------

## Cancellare un contratto

```http
PATCH /api/contracts/{id}/cancel
```

## Regole

- Un contratto `ACTIVE` non può essere cancellato.
- Un contratto `TERMINATED` non può essere cancellato.
- Un contratto `CANCELLED` non può essere cancellato di nuovo.
- Lo stato diventa `CANCELLED`.
- Il campo `cancelledAt` viene valorizzato.

------

## Rinnovare un contratto

```http
PATCH /api/contracts/{id}/renew
```

## Body di esempio

```json
{
  "newEndDate": "2028-12-31"
}
```

## Regole

- Solo un contratto `ACTIVE` può essere rinnovato.
- La nuova data di fine deve essere successiva all’attuale `endDate`.
- Lo stato rimane `ACTIVE`.
- Il campo `endDate` viene aggiornato.
- Il campo `renewedAt` viene valorizzato.

------

## Segnare un contratto come scaduto

```http
PATCH /api/contracts/{id}/expire
```

## Regole

- Solo un contratto `ACTIVE` può diventare `EXPIRED`.
- Il contratto può scadere solo dopo la data `endDate`.
- Lo stato del contratto diventa `EXPIRED`.
- Lo stato dell’immobile collegato diventa `AVAILABLE`.
- Il campo `expiredAt` viene valorizzato.

------

# Endpoint di filtro e ricerca per immobili

## Ottenere immobili per stato

```http
GET /api/properties/status/{status}
```

Esempio:

```http
GET /api/properties/status/AVAILABLE
```

------

## Ottenere immobili per città

```http
GET /api/properties/city/{city}
```

Esempio:

```http
GET /api/properties/city/Roma
```

------

## Ottenere immobili per tipologia

```http
GET /api/properties/type/{propertyType}
```

Esempio:

```http
GET /api/properties/type/APARTMENT
```

------

## Cercare immobili per keyword

```http
GET /api/properties/search?keyword=centro
```

## Regole

- La ricerca deve essere case-insensitive.
- La keyword può essere cercata in `title`, `description`, `address` e `city`.
- Se non viene trovato alcun immobile, restituire una lista vuota.

------

## Filtrare immobili per canone mensile

```http
GET /api/properties/filter?minRent=500&maxRent=1200
```

## Regole

- `minRent` deve essere minore o uguale a `maxRent`.
- I valori devono essere maggiori o uguali a 0.
- Devono essere restituiti solo gli immobili con `monthlyRent` compreso nell’intervallo indicato.

------

## Ottenere immobili disponibili

```http
GET /api/properties/available
```

## Regole

- Restituire solo immobili con stato `AVAILABLE`.
- Escludere immobili `RENTED`, `MAINTENANCE`, `DISABLED` e `DRAFT`.

------

# Endpoint di filtro e ricerca per contratti

## Ottenere contratti per stato

```http
GET /api/contracts/status/{status}
```

Esempio:

```http
GET /api/contracts/status/ACTIVE
```

------

## Ottenere contratti per inquilino

```http
GET /api/contracts/search?keyword=rossi
```

## Regole

- La ricerca deve essere case-insensitive.
- La keyword può essere cercata in `tenantName`, `tenantEmail` e `tenantPhone`.
- Se non viene trovato alcun contratto, restituire una lista vuota.

------

## Ottenere contratti in scadenza

```http
GET /api/contracts/expiring?days=30
```

## Regole

- Il parametro `days` deve essere maggiore di 0.
- Devono essere restituiti solo contratti `ACTIVE`.
- Devono essere restituiti solo contratti con `endDate` compresa tra oggi e oggi + `days`.

------

## Verificare disponibilità di un immobile per un periodo

```http
GET /api/contracts/check-availability?propertyId=3&startDate=2027-01-01&endDate=2027-12-31
```

## Regole

- L’immobile deve esistere.
- `startDate` deve essere precedente a `endDate`.
- Se esiste un contratto `SIGNED` o `ACTIVE` sovrapposto per lo stesso immobile, l’immobile non è disponibile.
- I contratti `CANCELLED`, `TERMINATED` ed `EXPIRED` non bloccano la disponibilità.

## Risposta attesa di esempio

```json
{
  "propertyId": 3,
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "available": true
}
```

------

# Endpoint statistiche

## Riepilogo generale immobili

```http
GET /api/properties/stats
```

## Risposta attesa di esempio

```json
{
  "totalProperties": 80,
  "availableProperties": 35,
  "rentedProperties": 28,
  "maintenanceProperties": 7,
  "disabledProperties": 4,
  "draftProperties": 6,
  "averageMonthlyRent": 850.00,
  "totalPotentialMonthlyRevenue": 29750.00
}
```

------

## Riepilogo generale contratti

```http
GET /api/contracts/stats
```

## Risposta attesa di esempio

```json
{
  "totalContracts": 140,
  "draftContracts": 12,
  "signedContracts": 8,
  "activeContracts": 55,
  "terminatedContracts": 38,
  "cancelledContracts": 15,
  "expiredContracts": 12,
  "totalActiveMonthlyRevenue": 46750.00,
  "averageContractDurationMonths": 18.5
}
```

------

## Riepilogo contratti per immobile

```http
GET /api/properties/{propertyId}/stats
```

## Risposta attesa di esempio

```json
{
  "propertyId": 3,
  "totalContracts": 5,
  "activeContracts": 1,
  "terminatedContracts": 3,
  "cancelledContracts": 1,
  "totalRevenueGenerated": 32400.00,
  "currentMonthlyRent": 900.00
}
```

------

# Regole di business generali

## Regole per RentalProperty

- Il titolo dell’immobile è obbligatorio.
- L’indirizzo è obbligatorio.
- La città è obbligatoria.
- La tipologia dell’immobile è obbligatoria.
- I metri quadri devono essere maggiori di 0.
- Il numero di stanze deve essere maggiore di 0.
- Il canone mensile deve essere maggiore di 0.
- Il deposito cauzionale non può essere negativo.
- Un immobile `RENTED` non può essere eliminato.
- Un immobile con contratti associati non dovrebbe essere eliminato, ma eventualmente disabilitato.
- Un immobile `DISABLED` non può essere affittato.
- Un immobile `MAINTENANCE` non può avere nuovi contratti attivi.

------

## Regole per RentalContract

- Il contratto deve essere associato a un immobile esistente.
- Il nome dell’inquilino è obbligatorio.
- L’email o il numero di telefono dell’inquilino devono essere presenti.
- La data di inizio è obbligatoria.
- La data di fine è obbligatoria.
- `startDate` deve essere precedente a `endDate`.
- Il canone mensile deve essere maggiore di 0.
- Il deposito cauzionale non può essere negativo.
- Non possono esistere due contratti `ACTIVE` sovrapposti per lo stesso immobile.
- Non possono esistere due contratti `SIGNED` o `ACTIVE` sovrapposti per lo stesso immobile.
- Un contratto `ACTIVE` non può essere modificato liberamente.
- Un contratto `TERMINATED` non può tornare `ACTIVE`.
- Un contratto `CANCELLED` non può essere firmato.
- Un contratto `EXPIRED` non può essere rinnovato direttamente.
- Un contratto eliminato viene rimosso definitivamente.
- Un contratto cancellato rimane nello storico.

------

# Possibili DTO richiesti

## RentalPropertyCreateRequest

```json
{
  "title": "Bilocale in centro",
  "description": "Appartamento ristrutturato vicino alla stazione.",
  "address": "Via Roma 25",
  "city": "Roma",
  "propertyType": "APARTMENT",
  "squareMeters": 65,
  "rooms": 2,
  "bathrooms": 1,
  "floor": 3,
  "monthlyRent": 850.00,
  "depositAmount": 1700.00,
  "ownerName": "Mario Bianchi",
  "ownerEmail": "mario.bianchi@example.com",
  "ownerPhone": "+393331234567"
}
```

------

## RentalPropertyResponse

```json
{
  "id": 1,
  "title": "Bilocale in centro",
  "description": "Appartamento ristrutturato vicino alla stazione.",
  "address": "Via Roma 25",
  "city": "Roma",
  "propertyType": "APARTMENT",
  "squareMeters": 65,
  "rooms": 2,
  "bathrooms": 1,
  "floor": 3,
  "monthlyRent": 850.00,
  "depositAmount": 1700.00,
  "status": "AVAILABLE",
  "ownerName": "Mario Bianchi",
  "ownerEmail": "mario.bianchi@example.com",
  "ownerPhone": "+393331234567",
  "createdAt": "2026-06-17T10:30:00",
  "updatedAt": null,
  "publishedAt": "2026-06-17T10:35:00",
  "rentedAt": null,
  "maintenanceAt": null,
  "disabledAt": null
}
```

------

## RentalContractCreateRequest

```json
{
  "propertyId": 1,
  "tenantName": "Luca Rossi",
  "tenantEmail": "luca.rossi@example.com",
  "tenantPhone": "+393441112233",
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "monthlyRent": 850.00,
  "depositAmount": 1700.00,
  "notes": "Contratto annuale con possibilità di rinnovo."
}
```

------

## RentalContractResponse

```json
{
  "id": 1,
  "propertyId": 1,
  "tenantName": "Luca Rossi",
  "tenantEmail": "luca.rossi@example.com",
  "tenantPhone": "+393441112233",
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "monthlyRent": 850.00,
  "depositAmount": 1700.00,
  "status": "DRAFT",
  "notes": "Contratto annuale con possibilità di rinnovo.",
  "createdAt": "2026-06-17T11:00:00",
  "updatedAt": null,
  "signedAt": null,
  "activatedAt": null,
  "terminatedAt": null,
  "cancelledAt": null,
  "expiredAt": null,
  "renewedAt": null
}
```

------

# Gestione errori consigliata

```http
400 Bad Request
```

Quando i dati inviati non rispettano le validazioni.

Esempio:

```json
{
  "error": "INVALID_CONTRACT_DATES",
  "message": "La data di inizio deve essere precedente alla data di fine."
}
```

------

```http
404 Not Found
```

Quando l’immobile o il contratto richiesto non esiste.

Esempio:

```json
{
  "error": "PROPERTY_NOT_FOUND",
  "message": "L'immobile richiesto non esiste."
}
```

------

```http
409 Conflict
```

Quando l’operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "PROPERTY_NOT_AVAILABLE",
  "message": "L'immobile indicato non è disponibile per il periodo selezionato."
}
```

Altro esempio:

```json
{
  "error": "INVALID_CONTRACT_STATUS",
  "message": "Solo un contratto in stato DRAFT può essere firmato."
}
```

Altro esempio:

```json
{
  "error": "ACTIVE_CONTRACT_ALREADY_EXISTS",
  "message": "Esiste già un contratto attivo per questo immobile."
}
```

------

# Obiettivo finale

Lo studente deve progettare e implementare una REST API completa che permetta di:

- gestire immobili in affitto;
- gestire contratti collegati agli immobili;
- applicare correttamente la relazione uno-a-molti;
- validare i dati in ingresso;
- gestire stati e transizioni;
- implementare filtri, ricerche e statistiche;
- restituire errori coerenti in base alla situazione;
- rispettare le principali regole di business del dominio degli affitti.