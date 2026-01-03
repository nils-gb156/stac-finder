# STAC-konforme Zeitbasierte Filterung

## Übersicht

Die API unterstützt jetzt STAC-konforme zeitbasierte Filterung über den `datetime` Query-Parameter. Die Implementierung basiert auf dem STAC API Specification Standard und ermöglicht Filterung nach Zeitintervallen mit Unterstützung für BEFORE, AFTER, DURING und CONTAINS Operationen.

## Query-Parameter

### `datetime`

Filtert Collections basierend auf deren temporaler Ausdehnung (temporal extent).

**Format:**
- Einzelner Zeitpunkt: `YYYY-MM-DDTHH:MM:SSZ`
- Geschlossenes Intervall: `START/END`
- Offenes Intervall (nach): `START/..`
- Offenes Intervall (vor): `../END`
- Komplett offen: `../..` (keine Filterung)

## Unterstützte Operationen

### 1. CONTAINS (Einzelner Zeitpunkt)
Findet Collections, die den angegebenen Zeitpunkt enthalten.

**Beispiel:**
```
GET /collections?datetime=2020-06-15T12:00:00Z
```

**Logik:**
- Collection wird zurückgegeben wenn: `temporal_start <= 2020-06-15T12:00:00Z` UND `temporal_end >= 2020-06-15T12:00:00Z`

### 2. DURING (Geschlossenes Intervall)
Findet Collections, deren temporale Ausdehnung sich mit dem angegebenen Intervall überschneidet.

**Beispiel:**
```
GET /collections?datetime=2020-01-01T00:00:00Z/2020-12-31T23:59:59Z
```

**Logik:**
- Collection wird zurückgegeben wenn: `temporal_start <= 2020-12-31T23:59:59Z` UND `temporal_end >= 2020-01-01T00:00:00Z`
- Überschneidung: Die Collection muss das Intervall ganz oder teilweise überlappen

### 3. AFTER (Offenes Ende)
Findet Collections, die am oder nach dem angegebenen Zeitpunkt enden.

**Beispiel:**
```
GET /collections?datetime=2020-06-01T00:00:00Z/..
```

**Logik:**
- Collection wird zurückgegeben wenn: `temporal_end >= 2020-06-01T00:00:00Z`

### 4. BEFORE (Offener Start)
Findet Collections, die am oder vor dem angegebenen Zeitpunkt beginnen.

**Beispiel:**
```
GET /collections?datetime=../2020-06-30T23:59:59Z
```

**Logik:**
- Collection wird zurückgegeben wenn: `temporal_start <= 2020-06-30T23:59:59Z`

## Unterstützte Datumsformate

Die API akzeptiert verschiedene ISO8601-konforme Datumsformate:

- Vollständiges Datum mit Zeit und UTC: `2020-06-15T12:30:45Z`
- Datum mit Zeit und Zeitzone: `2020-06-15T12:30:45+02:00`
- Datum mit Millisekunden: `2020-06-15T12:30:45.123Z`
- Nur Datum: `2020-06-15`

## Beispiele

### Beispiel 1: Collections für einen bestimmten Monat
```bash
curl "/collections?datetime=2020-06-01T00:00:00Z/2020-06-30T23:59:59Z"
```

### Beispiel 2: Collections die nach 2021 verfügbar sind
```bash
curl "/collections?datetime=2021-01-01T00:00:00Z/.."
```

### Beispiel 3: Collections die vor 2019 verfügbar sind
```bash
curl "/collections?datetime=../2019-12-31T23:59:59Z"
```

### Beispiel 4: Collections für einen spezifischen Tag
```bash
curl "/collections?datetime=2020-07-04"
```

### Beispiel 5: Kombination mit anderen Filtern
```bash
curl "/collections?datetime=2020-01-01/2020-12-31&q=sentinel&limit=10"
```

## Fehlerbehandlung

Die API gibt detaillierte Fehlermeldungen zurück bei:

### Ungültiges Format
```json
{
  "error": "Invalid datetime format",
  "message": "datetime must be a string"
}
```

### Ungültiges Datum
```json
{
  "error": "Invalid datetime",
  "message": "Invalid start datetime: not-a-date"
}
```

### Ungültiges Intervall
```json
{
  "error": "Invalid datetime interval",
  "message": "Start datetime must be before end datetime"
}
```

## Implementierungsdetails

### Datenbank-Schema
Die Filterung nutzt folgende Spalten in der `collections` Tabelle:
- `temporal_start`: Startdatum der Collection (TIMESTAMP)
- `temporal_end`: Enddatum der Collection (TIMESTAMP)

### SQL-Query-Generierung
Die Funktion `parseDatetimeFilter()` in [filtering.js](api/utils/filtering.js) generiert parameterisierte SQL WHERE-Klauseln, um SQL-Injection zu verhindern.

### Integration
Der Filter wird im [collections.js](api/controllers/collections.js) Controller integriert und mit anderen Filtern (wie Text-Suche) kombiniert.

## STAC-Konformität

Diese Implementierung folgt der STAC API Specification für temporale Filterung:
- ✅ Unterstützung für ISO8601 Datumsformate
- ✅ Unterstützung für Intervalle mit `/` Trenner
- ✅ Unterstützung für open-ended Intervalle mit `..`
- ✅ Logische Überschneidungsprüfung (overlap check)
- ✅ Korrekte Behandlung von einzelnen Zeitpunkten

## Tests

Unit-Tests für die datetime-Filterung finden sich in [datetime.test.js](api/tests/unit/datetime.test.js).

Zum Ausführen der Tests:
```bash
cd api
npm test -- tests/unit/datetime.test.js
```

Die Tests decken ab:
- ✅ Alle unterstützten Formate
- ✅ Fehlerbehandlung
- ✅ Edge-Cases
- ✅ STAC-Operationen (BEFORE, AFTER, DURING, CONTAINS)
