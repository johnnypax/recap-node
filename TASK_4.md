# Traccia: REST API per la gestione di Ispezioni di Sicurezza sul Lavoro

Realizzare una REST API per la gestione di **ispezioni di sicurezza sul lavoro** all'interno di cantieri, stabilimenti industriali, uffici o ambienti produttivi.

Il sistema deve permettere di registrare, pianificare, assegnare, eseguire, sospendere, completare e archiviare ispezioni legate alla sicurezza, alla conformità normativa e alla gestione delle non conformità.

L'obiettivo è creare una API REST basata su **una sola entità principale**, ma con endpoint più articolati rispetto alle semplici CRUD, includendo:

* ciclo di vita dell'ispezione;
* assegnazione a un ispettore;
* classificazione del rischio;
* pianificazione e ripianificazione;
* sospensione e ripresa;
* chiusura con esito;
* filtri avanzati;
* ricerca testuale;
* statistiche operative;
* gestione delle scadenze;
* validazioni;
* gestione coerente degli errori HTTP.

---

# Entità principale: SafetyInspection

Una ispezione rappresenta un controllo di sicurezza svolto su un sito, un reparto, un macchinario, un'attività o un'area aziendale.

## Campi suggeriti

```text
id
title
description
siteName
area
inspectionType
riskLevel
priority
status
requestedBy
assignedInspector
scheduledAt
startedAt
pausedAt
resumedAt
completedAt
closedAt
archivedAt
dueDate
findingsCount
criticalFindingsCount
outcome
notes
createdAt
updatedAt
```

---

## Esempi di `area`

```text
CONSTRUCTION_SITE
WAREHOUSE
PRODUCTION_LINE
OFFICE
LABORATORY
ELECTRICAL_ROOM
MACHINE_AREA
FIRE_SAFETY_AREA
```

---

## Esempi di `inspectionType`

```text
ROUTINE_CHECK
FIRE_SAFETY
ELECTRICAL_SAFETY
PPE_COMPLIANCE
MACHINE_SAFETY
CHEMICAL_STORAGE
EMERGENCY_EXIT
POST_INCIDENT
```

---

## Esempi di `riskLevel`

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

## Esempi di `priority`

```text
P1
P2
P3
P4
```

Esempio:

* `P1`: controllo immediato;
* `P2`: controllo urgente;
* `P3`: controllo ordinario;
* `P4`: controllo a bassa priorità.

---

## Esempi di `status`

```text
DRAFT
PLANNED
ASSIGNED
IN_PROGRESS
PAUSED
COMPLETED
CLOSED
ARCHIVED
CANCELLED
```

---

## Esempi di `outcome`

```text
COMPLIANT
MINOR_NON_CONFORMITIES
MAJOR_NON_CONFORMITIES
CRITICAL_NON_CONFORMITIES
NOT_APPLICABLE
```

---

# CRUD richieste per SafetyInspection

Implementare gli endpoint base per gestire le ispezioni.

```http
POST   /api/safety-inspections
GET    /api/safety-inspections
GET    /api/safety-inspections/{id}
PUT    /api/safety-inspections/{id}
DELETE /api/safety-inspections/{id}
```

La API deve permettere di:

* creare una nuova ispezione;
* visualizzare tutte le ispezioni;
* visualizzare il dettaglio di una ispezione;
* modificare una ispezione esistente;
* eliminare definitivamente una ispezione.

---

# Endpoint di ciclo di vita dell'ispezione

## Pianificare una ispezione

```http
PATCH /api/safety-inspections/{id}/plan
```

## Body di esempio

```json
{
  "scheduledAt": "2026-07-15T09:00:00",
  "dueDate": "2026-07-15T18:00:00"
}
```

## Regole

* Solo una ispezione in stato `DRAFT` può essere pianificata.
* `scheduledAt` deve essere una data futura.
* `dueDate` deve essere successiva a `scheduledAt`.
* Lo stato diventa `PLANNED`.
* Il campo `updatedAt` viene aggiornato.

---

## Assegnare una ispezione a un ispettore

```http
PATCH /api/safety-inspections/{id}/assign
```

## Body di esempio

```json
{
  "assignedInspector": "ispettore.sicurezza@example.com"
}
```

## Regole

* Solo una ispezione in stato `PLANNED` può essere assegnata.
* Il campo `assignedInspector` è obbligatorio.
* Lo stato diventa `ASSIGNED`.
* Una ispezione `CLOSED`, `ARCHIVED` o `CANCELLED` non può essere assegnata.

---

## Avviare una ispezione

```http
PATCH /api/safety-inspections/{id}/start
```

## Regole

* Solo una ispezione in stato `ASSIGNED` può essere avviata.
* L'ispezione deve avere un ispettore assegnato.
* `scheduledAt` deve essere valorizzato.
* Lo stato diventa `IN_PROGRESS`.
* Il campo `startedAt` viene valorizzato.

---

## Sospendere una ispezione

```http
PATCH /api/safety-inspections/{id}/pause
```

## Body di esempio

```json
{
  "reason": "Accesso all'area temporaneamente non consentito per attività di manutenzione straordinaria."
}
```

## Regole

* Solo una ispezione in stato `IN_PROGRESS` può essere sospesa.
* Il motivo della sospensione è obbligatorio.
* Lo stato diventa `PAUSED`.
* Il campo `pausedAt` viene valorizzato.

---

## Riprendere una ispezione sospesa

```http
PATCH /api/safety-inspections/{id}/resume
```

## Regole

* Solo una ispezione in stato `PAUSED` può essere ripresa.
* Lo stato diventa `IN_PROGRESS`.
* Il campo `resumedAt` viene valorizzato.
* Il campo `updatedAt` viene aggiornato.

---

## Completare una ispezione

```http
PATCH /api/safety-inspections/{id}/complete
```

## Body di esempio

```json
{
  "findingsCount": 5,
  "criticalFindingsCount": 1,
  "notes": "Rilevate criticità su estintori non accessibili e cartellonistica incompleta."
}
```

## Regole

* Solo una ispezione in stato `IN_PROGRESS` può essere completata.
* `findingsCount` deve essere maggiore o uguale a 0.
* `criticalFindingsCount` deve essere maggiore o uguale a 0.
* `criticalFindingsCount` non può essere maggiore di `findingsCount`.
* Se `criticalFindingsCount` è maggiore di 0, il `riskLevel` deve diventare almeno `HIGH`.
* Lo stato diventa `COMPLETED`.
* Il campo `completedAt` viene valorizzato.

---

## Chiudere una ispezione

```http
PATCH /api/safety-inspections/{id}/close
```

## Body di esempio

```json
{
  "outcome": "MAJOR_NON_CONFORMITIES",
  "notes": "Ispezione chiusa con prescrizione di interventi correttivi entro 15 giorni."
}
```

## Regole

* Solo una ispezione in stato `COMPLETED` può essere chiusa.
* Il campo `outcome` è obbligatorio.
* Se `criticalFindingsCount` è maggiore di 0, l'outcome non può essere `COMPLIANT`.
* Se `findingsCount` è uguale a 0, l'outcome dovrebbe essere `COMPLIANT` o `NOT_APPLICABLE`.
* Lo stato diventa `CLOSED`.
* Il campo `closedAt` viene valorizzato.
* Una ispezione chiusa non può essere modificata liberamente.

---

## Archiviare una ispezione

```http
PATCH /api/safety-inspections/{id}/archive
```

## Regole

* Solo una ispezione in stato `CLOSED` o `CANCELLED` può essere archiviata.
* Lo stato diventa `ARCHIVED`.
* Il campo `archivedAt` viene valorizzato.
* Una ispezione archiviata non deve comparire nella lista principale delle ispezioni operative.
* Una ispezione archiviata non può essere modificata.

---

## Annullare una ispezione

```http
PATCH /api/safety-inspections/{id}/cancel
```

## Body di esempio

```json
{
  "reason": "Ispezione annullata perché il sito non è più operativo."
}
```

## Regole

* Una ispezione `COMPLETED`, `CLOSED` o `ARCHIVED` non può essere annullata.
* Una ispezione `CANCELLED` non può essere annullata di nuovo.
* Il motivo dell'annullamento è obbligatorio.
* Lo stato diventa `CANCELLED`.
* Una ispezione annullata rimane nello storico.

---

# Endpoint avanzati sull'ispezione

## Cambiare livello di rischio

```http
PATCH /api/safety-inspections/{id}/risk-level
```

## Body di esempio

```json
{
  "riskLevel": "CRITICAL"
}
```

## Regole

* Il livello di rischio deve essere uno tra `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
* Una ispezione `CLOSED`, `ARCHIVED` o `CANCELLED` non può cambiare livello di rischio.
* Se il rischio diventa `CRITICAL`, la priorità deve diventare automaticamente almeno `P2`.
* Il campo `updatedAt` viene aggiornato.

---

## Cambiare priorità

```http
PATCH /api/safety-inspections/{id}/priority
```

## Body di esempio

```json
{
  "priority": "P1"
}
```

## Regole

* La priorità deve essere una tra `P1`, `P2`, `P3`, `P4`.
* Una ispezione `CLOSED`, `ARCHIVED` o `CANCELLED` non può cambiare priorità.
* Se la priorità diventa `P1`, la `dueDate` deve essere entro 24 ore.
* Il campo `updatedAt` viene aggiornato.

---

## Ripianificare una ispezione

```http
PATCH /api/safety-inspections/{id}/reschedule
```

## Body di esempio

```json
{
  "scheduledAt": "2026-07-18T10:00:00",
  "dueDate": "2026-07-18T17:00:00",
  "reason": "Rinvio per indisponibilità temporanea dell'area da ispezionare."
}
```

## Regole

* Solo una ispezione in stato `PLANNED` o `ASSIGNED` può essere ripianificata.
* `scheduledAt` deve essere futura.
* `dueDate` deve essere successiva a `scheduledAt`.
* Il motivo della ripianificazione è obbligatorio.
* Il campo `updatedAt` viene aggiornato.

---

## Aggiornare il numero di non conformità

```http
PATCH /api/safety-inspections/{id}/findings
```

## Body di esempio

```json
{
  "findingsCount": 8,
  "criticalFindingsCount": 2
}
```

## Regole

* Solo una ispezione in stato `IN_PROGRESS` o `COMPLETED` può aggiornare le non conformità.
* `findingsCount` deve essere maggiore o uguale a 0.
* `criticalFindingsCount` deve essere maggiore o uguale a 0.
* `criticalFindingsCount` non può superare `findingsCount`.
* Se ci sono non conformità critiche, il rischio deve essere almeno `HIGH`.
* Il campo `updatedAt` viene aggiornato.

---

## Dichiarare una ispezione urgente

```http
PATCH /api/safety-inspections/{id}/mark-urgent
```

## Regole

* Una ispezione `CLOSED`, `ARCHIVED` o `CANCELLED` non può diventare urgente.
* La priorità diventa `P1`.
* Il livello di rischio diventa almeno `HIGH`.
* La `dueDate`, se non presente, viene impostata entro 24 ore dalla data corrente.

---

# Endpoint di filtro e ricerca

## Ottenere ispezioni per area

```http
GET /api/safety-inspections/area/{area}
```

Esempio:

```http
GET /api/safety-inspections/area/WAREHOUSE
```

---

## Ottenere ispezioni per tipo

```http
GET /api/safety-inspections/type/{inspectionType}
```

Esempio:

```http
GET /api/safety-inspections/type/FIRE_SAFETY
```

---

## Ottenere ispezioni per stato

```http
GET /api/safety-inspections/status/{status}
```

Esempio:

```http
GET /api/safety-inspections/status/IN_PROGRESS
```

---

## Ottenere ispezioni per livello di rischio

```http
GET /api/safety-inspections/risk-level/{riskLevel}
```

Esempio:

```http
GET /api/safety-inspections/risk-level/CRITICAL
```

---

## Ottenere ispezioni assegnate a un ispettore

```http
GET /api/safety-inspections/assigned-to/{email}
```

Esempio:

```http
GET /api/safety-inspections/assigned-to/ispettore.sicurezza@example.com
```

## Regole

* Restituire solo ispezioni assegnate all'ispettore indicato.
* La ricerca deve essere case-insensitive sull'email.
* Se non ci sono ispezioni assegnate, restituire una lista vuota.

---

## Cercare ispezioni per parola chiave

Endpoint per cercare ispezioni nel titolo, nella descrizione, nel sito, nell'area o nelle note.

```http
GET /api/safety-inspections/search?keyword=estintori
```

## Regole

* La ricerca deve essere case-insensitive.
* La keyword può essere cercata in:
  * `title`;
  * `description`;
  * `siteName`;
  * `area`;
  * `notes`.
* Se non viene trovata alcuna ispezione, restituire una lista vuota.

---

## Ricerca avanzata ispezioni

```http
GET /api/safety-inspections/filter?area=WAREHOUSE&inspectionType=FIRE_SAFETY&riskLevel=HIGH&priority=P2&status=ASSIGNED
```

## Regole

* Tutti i parametri sono opzionali.
* Se vengono passati più parametri, devono essere applicati in AND.
* Se nessun parametro viene passato, restituire tutte le ispezioni non archiviate.
* I valori enum non validi devono restituire `400 Bad Request`.

---

## Ottenere ispezioni scadute

```http
GET /api/safety-inspections/overdue
```

## Regole

* Restituire ispezioni con `dueDate` precedente alla data attuale.
* Escludere ispezioni in stato `COMPLETED`, `CLOSED`, `ARCHIVED` o `CANCELLED`.
* Ordinare dal rischio più alto al più basso:
  1. `CRITICAL`
  2. `HIGH`
  3. `MEDIUM`
  4. `LOW`

---

## Ottenere ispezioni urgenti

```http
GET /api/safety-inspections/urgent
```

## Regole

* Restituire ispezioni con priorità `P1` o rischio `CRITICAL`.
* Escludere ispezioni chiuse, archiviate o annullate.
* Ordinare per `dueDate` crescente.

---

## Ottenere ispezioni programmate per oggi

```http
GET /api/safety-inspections/scheduled-today
```

## Regole

* Restituire ispezioni con `scheduledAt` nella giornata corrente.
* Escludere ispezioni `CLOSED`, `ARCHIVED` e `CANCELLED`.
* Ordinare per `scheduledAt` crescente.

---

# Endpoint statistiche

## Ottenere riepilogo generale delle ispezioni

```http
GET /api/safety-inspections/stats
```

## Risposta attesa di esempio

```json
{
  "totalInspections": 180,
  "draftInspections": 12,
  "plannedInspections": 25,
  "assignedInspections": 18,
  "inProgressInspections": 9,
  "pausedInspections": 3,
  "completedInspections": 40,
  "closedInspections": 60,
  "cancelledInspections": 8,
  "archivedInspections": 5,
  "criticalRiskInspections": 7,
  "overdueInspections": 4
}
```

---

## Ottenere statistiche per tipo di ispezione

```http
GET /api/safety-inspections/stats/by-type
```

## Risposta attesa di esempio

```json
{
  "ROUTINE_CHECK": 40,
  "FIRE_SAFETY": 25,
  "ELECTRICAL_SAFETY": 18,
  "PPE_COMPLIANCE": 32,
  "MACHINE_SAFETY": 20,
  "CHEMICAL_STORAGE": 12,
  "EMERGENCY_EXIT": 15,
  "POST_INCIDENT": 8
}
```

---

## Ottenere statistiche per livello di rischio

```http
GET /api/safety-inspections/stats/by-risk-level
```

## Risposta attesa di esempio

```json
{
  "LOW": 70,
  "MEDIUM": 65,
  "HIGH": 35,
  "CRITICAL": 10
}
```

---

## Ottenere statistiche per ispettore

```http
GET /api/safety-inspections/stats/by-inspector
```

## Risposta attesa di esempio

```json
[
  {
    "inspector": "ispettore.sicurezza@example.com",
    "assignedInspections": 14,
    "completedInspections": 10,
    "closedInspections": 8,
    "overdueInspections": 1,
    "criticalFindings": 3
  },
  {
    "inspector": "ispettore.antincendio@example.com",
    "assignedInspections": 9,
    "completedInspections": 7,
    "closedInspections": 6,
    "overdueInspections": 0,
    "criticalFindings": 1
  }
]
```

---

## Ottenere statistiche sulle non conformità

```http
GET /api/safety-inspections/stats/findings
```

## Risposta attesa di esempio

```json
{
  "totalFindings": 320,
  "totalCriticalFindings": 28,
  "averageFindingsPerInspection": 2.45,
  "inspectionsWithNoFindings": 50,
  "inspectionsWithCriticalFindings": 14
}
```

---

# Regole di business generali

* Il titolo dell'ispezione è obbligatorio.
* La descrizione dell'ispezione è obbligatoria.
* Il nome del sito è obbligatorio.
* L'area è obbligatoria.
* Il tipo di ispezione è obbligatorio.
* Il livello di rischio è obbligatorio.
* La priorità è obbligatoria.
* Il richiedente `requestedBy` è obbligatorio.
* Una ispezione appena creata deve avere stato `DRAFT`.
* Una ispezione `CLOSED` non può essere modificata liberamente.
* Una ispezione `ARCHIVED` non può essere modificata.
* Una ispezione `CANCELLED` non può essere modificata liberamente.
* Una ispezione non può essere avviata senza ispettore assegnato.
* Una ispezione non può essere chiusa senza prima essere stata completata.
* Una ispezione non può essere completata se è sospesa.
* Una ispezione sospesa può solo essere ripresa o annullata.
* Una ispezione con non conformità critiche non può avere outcome `COMPLIANT`.
* Una ispezione senza non conformità dovrebbe avere outcome `COMPLIANT` o `NOT_APPLICABLE`.
* `criticalFindingsCount` non può essere maggiore di `findingsCount`.
* Se `riskLevel` è `CRITICAL`, la priorità deve essere almeno `P2`.
* Se la priorità è `P1`, la `dueDate` deve essere entro 24 ore.
* La `dueDate`, se presente, deve essere successiva alla data di creazione.
* Il campo `updatedAt` deve essere aggiornato a ogni modifica.
* L'eliminazione tramite `DELETE` rimuove definitivamente l'ispezione.
* L'annullamento tramite `cancel` mantiene invece l'ispezione nello storico.

---

# Possibili DTO richiesti

## SafetyInspectionCreateRequest

```json
{
  "title": "Controllo antincendio magazzino principale",
  "description": "Verifica periodica degli estintori, delle uscite di emergenza e della segnaletica antincendio.",
  "siteName": "Stabilimento Roma Nord",
  "area": "WAREHOUSE",
  "inspectionType": "FIRE_SAFETY",
  "riskLevel": "HIGH",
  "priority": "P2",
  "requestedBy": "rspp@example.com",
  "notes": "Controllo richiesto prima dell'audit interno."
}
```

---

## SafetyInspectionUpdateRequest

```json
{
  "title": "Controllo antincendio magazzino principale - area nord",
  "description": "Verifica aggiornata su estintori, uscite di emergenza, illuminazione e segnaletica.",
  "siteName": "Stabilimento Roma Nord",
  "area": "WAREHOUSE",
  "inspectionType": "FIRE_SAFETY",
  "riskLevel": "MEDIUM",
  "priority": "P3",
  "requestedBy": "rspp@example.com",
  "notes": "Controllo ordinario aggiornato."
}
```

---

## SafetyInspectionResponse

```json
{
  "id": 1,
  "title": "Controllo antincendio magazzino principale",
  "description": "Verifica periodica degli estintori, delle uscite di emergenza e della segnaletica antincendio.",
  "siteName": "Stabilimento Roma Nord",
  "area": "WAREHOUSE",
  "inspectionType": "FIRE_SAFETY",
  "riskLevel": "HIGH",
  "priority": "P2",
  "status": "DRAFT",
  "requestedBy": "rspp@example.com",
  "assignedInspector": null,
  "scheduledAt": null,
  "startedAt": null,
  "pausedAt": null,
  "resumedAt": null,
  "completedAt": null,
  "closedAt": null,
  "archivedAt": null,
  "dueDate": null,
  "findingsCount": 0,
  "criticalFindingsCount": 0,
  "outcome": null,
  "notes": "Controllo richiesto prima dell'audit interno.",
  "createdAt": "2026-06-15T10:30:00",
  "updatedAt": null
}
```

---

## PlanInspectionRequest

```json
{
  "scheduledAt": "2026-07-15T09:00:00",
  "dueDate": "2026-07-15T18:00:00"
}
```

---

## AssignInspectionRequest

```json
{
  "assignedInspector": "ispettore.sicurezza@example.com"
}
```

---

## CompleteInspectionRequest

```json
{
  "findingsCount": 5,
  "criticalFindingsCount": 1,
  "notes": "Rilevate criticità su estintori non accessibili e cartellonistica incompleta."
}
```

---

## CloseInspectionRequest

```json
{
  "outcome": "MAJOR_NON_CONFORMITIES",
  "notes": "Ispezione chiusa con prescrizione di interventi correttivi entro 15 giorni."
}
```

---

# Gestione errori consigliata

La API dovrebbe restituire errori coerenti.

```http
400 Bad Request
```

Quando i dati inviati non rispettano le validazioni.

Esempio:

```json
{
  "error": "INVALID_FINDINGS_COUNT",
  "message": "Il numero di non conformità critiche non può superare il numero totale di non conformità."
}
```

---

```http
404 Not Found
```

Quando l'ispezione richiesta non esiste.

Esempio:

```json
{
  "error": "INSPECTION_NOT_FOUND",
  "message": "Nessuna ispezione trovata con id 15."
}
```

---

```http
409 Conflict
```

Quando l'operazione richiesta viola lo stato corrente della risorsa.

Esempio:

```json
{
  "error": "INVALID_STATUS_TRANSITION",
  "message": "Una ispezione CLOSED non può passare direttamente in IN_PROGRESS."
}
```

Altro esempio:

```json
{
  "error": "INSPECTION_NOT_COMPLETED",
  "message": "Una ispezione può essere chiusa solo dopo essere stata completata."
}
```

---

# Livello di difficoltà richiesto

La traccia è pensata per uno studente che abbia già visto:

* CRUD REST;
* DTO di request e response;
* validazioni;
* enum;
* endpoint `PATCH`;
* path variable;
* query param;
* filtri semplici e avanzati;
* gestione delle date;
* transizioni di stato;
* logica di business nello strato service;
* gestione degli errori HTTP;
* statistiche aggregate;
* ordinamento dei risultati;
* calcolo di scadenze;
* modellazione di workflow applicativi;
* regole di coerenza tra rischio, priorità ed esito.
