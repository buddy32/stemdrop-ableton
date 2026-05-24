# StemDrop-Ableton

## 1. Was ist StemDrop-Ableton?

StemDrop-Ableton zielt auf einen Ableton/Max-for-Live gesteuerten Remote-Stem-Transfer.

Das Zielbild ist: Ein Max-for-Live-Device in Ableton steuert Verbindung, Room Code, Senden, Status und Transfer-Fortschritt. Eine lokale Node Helper App uebernimmt Datei- und Netzwerklogik und verbindet sich mit einem Internet Relay Server.

Aktueller Stand: ein Node/Electron-Prototyp fuer lokale Tests, Datei-Transfer, Transfer-History und eine einfache lokale GUI. Der naechste Schritt ist eine kleine Local Helper API fuer Max for Live.

Der bestehende Prototyp kann Audio-Dateien zwischen zwei lokalen Clients austauschen.

Wichtig:

- Keine Cloud.
- Keine externen APIs.
- Dateien bleiben auf deinen Macs.
- Originaldateien werden nicht geloescht.
- Unterstuetzte Dateien: `.wav`, `.aiff`, `.mp3`.

## 2. Installation

Du brauchst Node.js und npm.

Im Projektordner einmal ausfuehren:

```bash
npm install
```

Danach sind alle lokalen Abhaengigkeiten installiert.

Nuetzliche Befehle:

```bash
npm start
```

Startet den Relay-Server fuer Deployment-Umgebungen wie Render.

```bash
npm run server
```

Startet den Netzwerk-Server.

## Local Mode und Internet Relay Mode

Local Mode:

- Relay Server lokal starten: `npm run server`
- Local Helper API lokal starten: `npm run helper`
- Max for Live spricht mit `http://127.0.0.1:3030`
- Relay URL fuer lokale Tests: `ws://127.0.0.1:8787`

Internet Relay Mode:

- Relay Server oeffentlich deployen, zum Beispiel auf Render.com.
- Local Helper API bleibt lokal auf dem Ableton-Rechner.
- Max for Live steuert weiter die Local Helper API.
- Relay URL fuer Render: `wss://<render-service-name>.onrender.com`

```bash
npm run client
```

Startet den Client, der Dateien senden und empfangen kann.

```bash
npm run demo
```

Erzeugt eine kleine Demo-WAV-Datei in `shared/outgoing`.

```bash
npm run analyze
```

Zeigt Audio-Dateien in `shared/outgoing` und `shared/incoming` mit Typ und Groesse an.

```bash
npm run history
```

Zeigt die letzten protokollierten Transfers aus `logs/transfers.json` im Terminal an.

## 3. Lokaler Test auf einem Mac

Dieser Test prueft alles auf einem einzigen Mac.

Terminal 1:

```bash
npm run server
```

Der Server zeigt einen Room-Code und lokale Adressen an. Lasse dieses Terminal offen.

Terminal 2:

```bash
npm run simulate
```

Die Simulation startet zwei lokale Clients, erstellt eine Testdatei, sendet sie und prueft danach, ob die empfangene Datei identisch ist.

Danach kannst du pruefen, welche Dateien vorhanden sind:

```bash
npm run analyze
```

Die Transfer-History kannst du so anzeigen:

```bash
npm run history
```

Optional kannst du auch eine Demo-WAV erzeugen:

```bash
npm run demo
```

## 4. Test mit zwei Macs im gleichen WLAN

Beide Macs muessen im gleichen WLAN sein. Beide Macs brauchen den Projektordner und muessen einmal `npm install` ausgefuehrt haben.

Auf Mac A:

```bash
npm run server
```

Der Server zeigt etwas in dieser Art:

```text
[SERVER] Port: 8787
[SERVER] Room-Code: ABC123
[SERVER] WLAN/LAN-Adressen fuer den zweiten Mac:
ws://192.168.2.179:8787
```

Merke dir:

- Server-IP: im Beispiel `192.168.2.179`
- Port: im Beispiel `8787`
- Room-Code: im Beispiel `ABC123`

Auf Mac A in einem zweiten Terminal:

```bash
npm run client
```

Gib die Werte ein:

```text
Server-IP: 192.168.2.179
Port [8787]: 8787
Room-Code: ABC123
```

Auf Mac B:

```bash
npm run client
```

Gib dieselben Werte ein.

Jetzt koennen beide Macs Dateien senden:

1. Lege eine `.wav`, `.aiff` oder `.mp3` Datei in `shared/outgoing`.
2. Der Client sendet die Datei automatisch.
3. Auf dem anderen Mac landet die Datei in `shared/incoming`.
4. Im Terminal siehst du den Fortschritt in Prozent.

## 5. Welche Ordner wofuer da sind

```text
shared/outgoing
```

Hier legst du Dateien ab, die gesendet werden sollen.

```text
shared/incoming
```

Hier landen empfangene Dateien.

```text
server
```

Enthaelt den Netzwerk-Server, den lokalen Watcher, die Demo-Erzeugung und Analyse.

```text
client
```

Enthaelt den lokalen Client und die Simulation fuer Tests auf einem Mac.

```text
maxforlive
```

Enthaelt Ideen fuer eine spaetere Ableton/Max-for-Live-Anbindung.

```text
docs
```

Enthaelt zusaetzliche Projektnotizen und Roadmap-Dateien.

```text
logs/transfers.json
```

Speichert die Transfer-History. Jeder neue gesendete oder empfangene Stem bekommt einen Eintrag mit Zeitstempel, Richtung, Dateiname, Groesse, Room-Code, Quelle und Ziel.

## 6. Bekannte Grenzen

- Es ist ein MVP-Prototyp, noch kein fertiges Produkt.
- Es gibt noch keine grafische Oberflaeche.
- Der Transfer ist fuer normale Audio-Dateien gedacht, nicht fuer riesige Archive.
- Abgebrochene Transfers werden noch nicht automatisch fortgesetzt.
- Es gibt noch keine Verschluesselung und keine Nutzer-Accounts.
- Der Server erlaubt aktuell zwei Clients pro Room.
- macOS-Firewall oder WLAN-Einstellungen koennen Verbindungen blockieren.
- Ableton wird noch nicht automatisch gesteuert.

## 7. Roadmap Richtung Ableton/Max for Live

- Local Helper API fuer Max for Live definieren und anbinden.
- Max-for-Live Device als primaere Steueroberflaeche fuer Relay URL, Room Code, Senden und Status.
- Internet Relay Server als Verbindungsweg zwischen zwei lokalen Helper Apps.
- Kleine Client-Oberflaeche fuer Room-Code, Verbindungsstatus und Transfers.
- Metadaten mitsenden: Track-Name, Clip-Name, Tempo, Tonart, Session-Name.
- Max-for-Live Device mit Room-Code und Transferanzeige.
- OSC-Bridge zwischen Node.js und Max for Live.
- MIDI-Trigger fuer manuelles Senden oder Importieren.
- WebSocket-Verbindung direkt aus Max for Live.
- Eingehende Dateien in Ableton sichtbar machen.
- Spaeter: komfortabler Import in Tracks oder Clips.

## Max-for-Live Status-Test

Der erste minimale Max-for-Live-Prototyp liegt in `maxforlive/STEMDROP_STATUS_TEST.maxpat`.

Vor dem Laden in Ableton die Local Helper API starten:

```bash
npm run helper
```

Dann den Patch in Max for Live oeffnen und den Button klicken. Die JSON-Antwort von `http://127.0.0.1:3030/status` erscheint in der Max Console.

## GUI starten

Die lokale GUI soll Terminaleingaben ersetzen. Sie bietet:

- Start Server Button
- Verbinde zu Room Button
- Room-Code Anzeige
- Anzeige verbundener Clients
- Drag & Drop fuer Dateien aus `shared/outgoing`
- Transfer-Fortschritt
- Transfer-History
- Buttons fuer Incoming- und Outgoing-Ordner
- Dark Mode im Stil moderner Audio-Tools

Start:

```bash
npm run gui
```

Hinweis: Dateien duerfen aus Sicherheitsgruenden nur aus `shared/outgoing` gesendet werden. Empfangene Dateien landen weiter in `shared/incoming`. Es gibt keine Cloud, keine Accounts und keine externen APIs.
