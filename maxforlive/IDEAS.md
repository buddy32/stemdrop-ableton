# Max-for-Live Ideen

## OSC Ideen

- Max-for-Live Device sendet OSC-Nachrichten, wenn ein Stem exportiert wurde.
- Node-Watcher sendet OSC-Bestaetigung zurueck, sobald eine Datei in `shared/incoming` liegt.
- Moegliche Messages:
  - `/stemdrop/file/added`
  - `/stemdrop/file/copied`
  - `/stemdrop/session/status`

## MIDI Ideen

- MIDI-Noten oder CCs als einfache Trigger fuer Export- oder Import-Aktionen.
- MIDI Clock kann spaeter helfen, Session-Kontext wie Tempo zu erfassen.
- Ableton Clip- oder Track-Auswahl koennte ueber MIDI-Mapping Aktionen ausloesen.

## WebSocket Ideen

- Lokaler WebSocket-Server als spaetere Echtzeit-Bruecke zwischen Node.js, Client-UI und Max-for-Live.
- Events fuer neue Dateien, Transferstatus und Session-Metadaten.
- Gute Grundlage fuer Netzwerk-Sync zwischen zwei Nutzern.
- Room-Code kann als einfache Session-ID fuer zwei Ableton-Instanzen dienen.
- Max-for-Live Device koennte Transferstatus, Peer-Status und neue Dateien anzeigen.
- Device koennte Server-IP, Port und Room-Code aus einer kleinen UI heraus setzen.
- Transfer-Fortschritt kann als Prozentwert in Max angezeigt werden.

## Moegliche Ableton Integration

- Max-for-Live Device zeigt eingehende Stems direkt in Ableton an.
- Device kann aktuelle Track-Infos an den Node-Prozess senden.
- Exportierte Clips koennen automatisch in `shared/outgoing` abgelegt werden.
- Eingehende Dateien koennen spaeter per Drag-and-drop oder API-gestuetztem Workflow in Ableton importiert werden.
