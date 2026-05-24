# Roadmap

## MVP

- Lokaler Watcher fuer `shared/outgoing`.
- Kopie nach `shared/incoming`.
- Demo-WAV-Erzeugung.
- Analyse von Typ und Groesse.
- Lokaler WebSocket-Server mit Room-Code.
- Simulierter Transfer zwischen zwei lokalen Clients.
- Netzwerkmodus fuer zwei Macs im gleichen WLAN.
- Interaktiver Client mit Server-IP, Port und Room-Code.

## Naechste Iteration

- Saubere Dateinamen-Strategie bei Kollisionen.
- Kleine lokale Web-UI im `client`-Ordner.
- JSON-Metadaten neben Audio-Dateien.
- Stabilere Tests fuer grosse Dateien und langsame Kopiervorgaenge.
- Echte Client-UI fuer Room-Code, Datei-Auswahl und Fortschritt.
- Datei-Kollisionen beim WebSocket-Empfang sauber nummerieren.

## Spaeter

- Transfer-Wiederaufnahme nach Verbindungsabbruch.
- Optionaler Binaertransfer ohne Base64 fuer grosse Stems.
- Max-for-Live Device.
- OSC, MIDI oder WebSocket Transport.
- Ableton Session-Kontext: Tempo, Track, Clip, Arrangement-Position.
