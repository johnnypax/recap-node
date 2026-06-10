# Traccia: REST API per la gestione di Missioni di Addestramento Cybersecurity

Realizzare una REST API per la gestione di **missioni di addestramento cybersecurity**.

Ogni missione rappresenta una sfida tecnica che un utente potrebbe affrontare in un ambiente simulato, ad esempio:

- analisi di log;
- hardening di un server;
- identificazione di vulnerabilità;
- risposta a incidente;
- configurazione firewall;
- analisi malware simulata.

L'obiettivo è creare una API REST basata su **una sola entità principale**, ma con CRUD complete ed endpoint aggiuntivi legati al ciclo di vita della missione.

---

## Entità principale: Mission

La missione rappresenta una challenge tecnica.

### Campi suggeriti

```text
id
title
description
category
difficulty
estimatedMinutes
status
score
requiredTools
solution
createdAt
updatedAt
completedAt
```

### Esempi di `category`

```text
LOG_ANALYSIS
NETWORK_SECURITY
WEB_SECURITY
LINUX_HARDENING
INCIDENT_RESPONSE
MALWARE_ANALYSIS
```

### Esempi di `difficulty`

```text
EASY
MEDIUM
HARD
EXPERT
```

### Esempi di `status`

```text
DRAFT
ACTIVE
COMPLETED
FAILED
ARCHIVED
```

---

# CRUD richieste

Implementare gli endpoint per gestire le missioni.

```http
POST   /api/missions
GET    /api/missions
GET    /api/missions/{id}
PUT    /api/missions/{id}
DELETE /api/missions/{id}
```

La API deve permettere di:

- creare una nuova missione;
- visualizzare tutte le missioni;
- visualizzare il dettaglio di una missione;
- modificare una missione esistente;
- eliminare una missione.

---

# Endpoint particolari

## Attivare una missione

Una missione appena creata parte in stato `DRAFT`.
Per renderla disponibile deve essere attivata.

```http
PATCH /api/missions/{id}/activate
```

### Regole

- Una missione può essere attivata solo se è in stato `DRAFT`.
- Una missione senza titolo, descrizione o categoria non può essere attivata.
- Quando viene attivata, lo stato diventa `ACTIVE`.

---

## Completare una missione

Permette di segnare una missione come completata.

```http
PATCH /api/missions/{id}/complete
```

### Regole

- Solo una missione `ACTIVE` può essere completata.
- Quando viene completata, lo stato diventa `COMPLETED`.
- Il campo `completedAt` viene valorizzato.
- Una missione completata non può essere modificata liberamente.

---

## Fallire una missione

Permette di segnare una missione come fallita.

```http
PATCH /api/missions/{id}/fail
```

### Regole

- Solo una missione `ACTIVE` può essere fallita.
- Quando viene fallita, lo stato diventa `FAILED`.
- Una missione fallita può eventualmente essere riattivata.

---

## Archiviare una missione

Permette di archiviare una missione senza eliminarla fisicamente.

```http
PATCH /api/missions/{id}/archive
```

### Regole

- Una missione archiviata non deve comparire tra le missioni attive.
- Una missione archiviata non può essere completata o fallita.
- Lo stato diventa `ARCHIVED`.

---

## Riattivare una missione fallita

Permette di riportare una missione fallita allo stato attivo.

```http
PATCH /api/missions/{id}/retry
```

### Regole

- Solo una missione in stato `FAILED` può essere riattivata.
- Quando viene riattivata, lo stato torna `ACTIVE`.
- Il campo `completedAt` deve rimanere vuoto.

---

## Ottenere missioni per categoria

Endpoint per filtrare le missioni in base alla categoria.

```http
GET /api/missions/category/{category}
```

Esempio:

```http
GET /api/missions/category/WEB_SECURITY
```

---

## Ottenere missioni per difficoltà

Endpoint per filtrare le missioni in base alla difficoltà.

```http
GET /api/missions/difficulty/{difficulty}
```

Esempio:

```http
GET /api/missions/difficulty/HARD
```

---

## Cercare missioni per parola chiave

Endpoint per cercare missioni nel titolo o nella descrizione.

```http
GET /api/missions/search?keyword=firewall
```

### Regole

- La ricerca deve essere case-insensitive.
- La keyword può essere cercata nel titolo e nella descrizione.
- Se non viene trovata alcuna missione, restituire una lista vuota.

---

## Ottenere il riepilogo delle missioni

Endpoint che restituisce un riepilogo numerico.

```http
GET /api/missions/stats
```

### Risposta attesa di esempio

```json
{
  "totalMissions": 20,
  "activeMissions": 6,
  "completedMissions": 8,
  "failedMissions": 3,
  "archivedMissions": 3,
  "averageScore": 75
}
```

---

# Regole di business generali

- Il titolo della missione è obbligatorio.
- La categoria è obbligatoria.
- La difficoltà è obbligatoria.
- Il punteggio deve essere compreso tra 0 e 100.
- La durata stimata deve essere maggiore di 0.
- Una missione archiviata non può essere modificata.
- Una missione completata non può tornare direttamente in `DRAFT`.
- Una missione eliminata viene rimossa definitivamente, mentre una missione archiviata rimane nello storico.
