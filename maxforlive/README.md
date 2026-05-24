# StemDrop Max for Live Status Test

Dies ist der erste minimale Max-for-Live-Test fuer StemDrop.

Funktion:

- Button klicken.
- `GET http://127.0.0.1:3030/status` wird an die lokale StemDrop Helper API gesendet.
- Die JSON-Antwort erscheint in der Max Console.
- `online`, `roomCode` und `connectedClients` werden im Patch angezeigt.

## Vorbereitung

Im Projektordner die Local Helper API starten:

```bash
npm run helper
```

Optional kann zusaetzlich der lokale Relay Server laufen:

```bash
npm run server
```

## In Ableton laden

1. Ableton Live mit Max for Live oeffnen.
2. Ein leeres MIDI- oder Audio-Track-Device mit Max for Live erstellen.
3. In Max `STEMDROP_STATUS_TEST.maxpat` oeffnen.
4. Die Datei `stemdrop_status_test.js` muss im selben Ordner wie der Patch bleiben.
5. Button im Patch klicken.
6. Die Max Console oeffnen, um die rohe JSON-Antwort zu sehen.

Dieser Patch macht noch keine Audiofunktionen und keine Transfers.
