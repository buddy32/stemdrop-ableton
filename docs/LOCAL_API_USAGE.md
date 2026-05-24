# Local API Usage

Die Local Helper API ist die erste kleine Steuer-Schnittstelle fuer ein spaeteres Max-for-Live-Device.

Start:

```bash
npm run helper
```

Basis-URL:

```text
http://127.0.0.1:3030
```

Status pruefen:

```bash
curl http://127.0.0.1:3030/status
```

Mit einem Relay verbinden:

```bash
curl -X POST http://127.0.0.1:3030/connect \
  -H "content-type: application/json" \
  -d '{"relayUrl":"ws://127.0.0.1:8787","roomCode":"ABC123"}'
```

Datei senden:

```bash
curl -X POST http://127.0.0.1:3030/send \
  -H "content-type: application/json" \
  -d '{"path":"/Users/name/Music/Ableton/Stems/bass.wav"}'
```

History lesen:

```bash
curl http://127.0.0.1:3030/history
```

Incoming-Ordner oeffnen:

```bash
curl -X POST http://127.0.0.1:3030/open-incoming
```
