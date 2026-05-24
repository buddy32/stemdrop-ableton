# Max for Live Bridge Plan

## Zielbild

StemDrop-Ableton soll von einem Max-for-Live-Device in Ableton gesteuert werden. Das Device ist die Bedienoberflaeche im Musik-Workflow; die lokale Node Helper App uebernimmt Netzwerk, Dateien und Betriebssystemzugriff.

Architektur:

```text
Max for Live Device
-> lokale Node Helper App
-> Internet Relay Server
-> lokale Node Helper App
-> Max for Live Device
```

## Rolle des Max-for-Live-Devices

Das Max-for-Live-Device lebt direkt in Ableton und ist der Einstiegspunkt fuer Musikerinnen und Musiker.

Es soll:

- Relay URL und Room Code aufnehmen.
- Die Verbindung starten.
- Einen Stem-Transfer aus Ableton heraus anstossen.
- Eingehende Dateien sichtbar machen.
- Status und Transfer-Fortschritt anzeigen.

Das Device soll keine komplexe Netzwerk- oder Datei-Logik enthalten. Es spricht nur mit der lokalen Node Helper App.

## Rolle der lokalen Node Helper App

Die lokale Node Helper App laeuft auf demselben Rechner wie Ableton. Sie ist die Bruecke zwischen Max for Live und dem Relay Server.

Sie soll:

- Eine lokale API auf `localhost` anbieten.
- Befehle vom M4L-Device entgegennehmen.
- Die Verbindung zum Relay Server halten.
- Dateien aus erlaubten lokalen Pfaden lesen und senden.
- Empfangene Stems in `shared/incoming` ablegen.
- Transfer-History und Status bereitstellen.
- Den Incoming-Ordner im Betriebssystem oeffnen.

Empfohlener lokaler Port: `3030`.

## Rolle des Internet Relay Servers

Der Internet Relay Server verbindet zwei lokale Node Helper Apps ueber einen gemeinsamen Room Code.

Er soll:

- Rooms verwalten.
- Helper Apps miteinander verbinden.
- Stem-Daten weiterleiten.
- Fortschritt und Verbindungsstatus ermoeglichen.

Der Relay Server kennt Ableton nicht direkt. Ableton kommuniziert nur ueber das lokale M4L-Device und die lokale Helper App.

## Warum M4L nicht den kompletten Filetransfer machen sollte

Max for Live ist gut fuer Ableton-Integration, UI, Parameter und einfache Steuerbefehle. Vollstaendiger Filetransfer ist dort unnoetig schwer und fehleranfaellig.

Die Node Helper App ist besser geeignet fuer:

- Stabile WebSocket- oder HTTP-Verbindungen.
- Datei-Streams und groessere Audio-Dateien.
- Zugriff auf lokale Ordner.
- Transfer-History.
- Fehlerbehandlung und Wiederverbindung.
- Spaetere Plattformdetails ausserhalb von Ableton.

So bleibt das M4L-Device klein, musikalisch bedienbar und leichter wartbar.

## Kommunikation zwischen M4L und Node Helper

M4L spricht lokal mit der Node Helper App, entweder per HTTP oder WebSocket.

Empfehlung fuer den ersten Schritt:

- HTTP fuer einfache Befehle.
- Optional WebSocket spaeter fuer Live-Status und Transfer-Fortschritt.
- Host: `127.0.0.1`
- Port: `3030`

Einfache Befehle:

```text
connect(roomCode, relayUrl)
sendFile(path)
getStatus()
openIncoming()
```

## M4L UI-Elemente

Das Max-for-Live-Device soll minimal und klar bleiben:

- Relay URL
- Room Code
- Connect Button
- Send Stem Button
- Incoming Button
- Statusanzeige
- Transfer Progress
