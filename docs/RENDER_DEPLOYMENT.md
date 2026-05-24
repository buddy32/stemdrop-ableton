# Render Deployment

Diese Anleitung beschreibt den StemDrop Relay Server als oeffentlichen Web Service auf Render.com.

## Ziel

Render startet den bestehenden WebSocket Relay Server:

```bash
npm start
```

Der Server bindet an:

```text
HOST=0.0.0.0
PORT=<von Render gesetzt>
```

## Vorbereitung

Die relevanten Dateien:

- `package.json` mit `start`
- `server/ws-server.js` mit `process.env.PORT`
- `render.yaml`

## Deployment Schritte

1. Repository zu GitHub pushen.
2. Bei Render.com einloggen.
3. New > Blueprint auswaehlen.
4. Das GitHub Repository verbinden.
5. Render erkennt `render.yaml`.
6. Service `stemdrop-relay` erstellen.
7. Deploy starten.
8. Nach dem Deploy die Render URL kopieren.

Die Relay URL fuer StemDrop ist dann:

```text
wss://<render-service-name>.onrender.com
```

## Lokaler Test

```bash
HOST=0.0.0.0 PORT=8787 npm run server
```

Erwartung:

```text
[SERVER] StemDrop Netzwerkmodus gestartet
[SERVER] Port: 8787
```

## Hinweise

- Render setzt `PORT` automatisch.
- Fuer lokale Tests kann weiter `STEMDROP_WS_PORT` verwendet werden.
- Fuer Render sollte der Host `0.0.0.0` sein.
- Der Relay Server speichert keine Dateien dauerhaft.
- Der erste Request nach Inaktivitaet kann beim kostenlosen Render Plan kurz dauern.
