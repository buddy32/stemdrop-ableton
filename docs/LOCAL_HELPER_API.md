# Local Helper API

Diese API beschreibt die lokale Schnittstelle zwischen dem Max-for-Live-Device und der Node Helper App.

Basis:

```text
http://127.0.0.1:3030
```

Die API ist bewusst klein gehalten. Sie soll zuerst Steuerbefehle und Status liefern; der bestehende Transfer-Code kann spaeter dahinter angebunden werden.

## GET /status

Liefert den aktuellen Zustand der lokalen Helper App.

Antwort:

```json
{
  "connected": false,
  "roomCode": null,
  "relayUrl": null,
  "peerCount": 0,
  "lastError": null,
  "activeTransfer": null
}
```

`activeTransfer` kann bei laufendem Transfer Fortschritt enthalten:

```json
{
  "id": "transfer-123",
  "fileName": "stem.wav",
  "direction": "send",
  "percent": 42
}
```

## POST /connect

Verbindet die lokale Helper App mit einem Relay Server und Room Code.

Request:

```json
{
  "roomCode": "ABC123",
  "relayUrl": "wss://relay.example.com"
}
```

Antwort:

```json
{
  "ok": true,
  "connected": true,
  "roomCode": "ABC123",
  "relayUrl": "wss://relay.example.com"
}
```

## POST /send

Sendet eine lokale Audiodatei ueber den verbundenen Room.

Request:

```json
{
  "path": "/Users/name/Music/Ableton/Stems/bass.wav"
}
```

Antwort:

```json
{
  "ok": true,
  "transferId": "transfer-123",
  "fileName": "bass.wav"
}
```

Hinweis: Die Helper App soll pruefen, ob der Pfad erlaubt ist und ob die Datei ein unterstuetztes Audioformat hat.

## GET /history

Liefert die letzten Transfers.

Antwort:

```json
{
  "items": [
    {
      "time": "2026-05-24T10:00:00.000Z",
      "direction": "send",
      "fileName": "bass.wav",
      "size": 1234567,
      "roomCode": "ABC123"
    }
  ]
}
```

## POST /open-incoming

Oeffnet den lokalen Incoming-Ordner im Betriebssystem.

Request:

```json
{}
```

Antwort:

```json
{
  "ok": true
}
```
