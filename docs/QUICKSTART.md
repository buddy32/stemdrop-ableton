# StemDrop Quickstart

## Internet Relay testen

Auf Mac A den Render Relay Client starten:

```bash
npm run dev:render-client
```

Dann nur den Room-Code eingeben, den der Render Relay Server anzeigt.

Erwartung:

```text
[CLIENT] Verbinde mit wss://stemdrop-relay.onrender.com
```

Auf Mac B denselben Befehl starten und denselben Room-Code eingeben.

## GUI benutzen

Die Desktop-App starten:

```bash
npm run gui
```

Auf dem ersten Rechner `Neue Session` klicken. Die GUI verbindet sich automatisch mit dem Internet Relay und zeigt sofort den Room-Code an.

Mit `Code kopieren` den Code in die Zwischenablage legen und an den zweiten Client schicken. Dort denselben Code ins Room-Code-Feld eingeben und `Connect` klicken.

Wenn zwei Clients im selben Room sind, zeigt die App `Verbunden` und die Peer-Anzahl an.

Zum Senden eine WAV-, AIFF- oder MP3-Datei in den Drag-and-Drop-Bereich ziehen. Die App kopiert die Datei nach `shared/outgoing`, sendet sie ueber den Internet Relay und zeigt den Fortschritt an.

Empfangene Dateien liegen in `shared/incoming`. Der Button `Incoming-Ordner` oeffnet den Ordner direkt, die History-Liste zeigt die letzten Transfers.

## Zwei lokale Clients starten

Terminal 1:

```bash
npm run server
```

Den angezeigten Room-Code merken.

Terminal 2:

```bash
npm run dev:client
```

Als Server-IP `127.0.0.1`, als Port `8787` und als Room-Code den angezeigten Code eingeben.

Terminal 3:

```bash
npm run dev:client
```

Dieselben Werte eingeben.

## Datei senden

Eine Audiodatei in diesen Ordner legen:

```text
shared/outgoing
```

Der laufende Client sendet die Datei automatisch, sobald beide Clients im Room verbunden sind.

## Ergebnis pruefen

Empfangene Dateien landen hier:

```text
shared/incoming
```

Die letzten Transfers anzeigen:

```bash
npm run history
```

## Relay-Test lokal automatisieren

Wenn ein lokaler Relay Server laeuft:

```bash
npm run test:relay
```

Der Test startet zwei lokale Test-Clients, sendet eine Demo-Datei und vergleicht Quelle und Ziel.
