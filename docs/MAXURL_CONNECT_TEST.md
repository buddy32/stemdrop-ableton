# MAXURL Connect Test

Dieser Patch testet die Verbindung von Max for Live zur lokalen StemDrop Helper API ohne `node.script`.

Datei:

```text
maxforlive/MAXURL_CONNECT_TEST.maxpat
```

## Funktion

- Relay URL Default: `ws://127.0.0.1:8787`
- Room Code Default: `TEST01`
- Connect Button
- POST an `http://127.0.0.1:3030/connect`
- Danach automatischer GET an `http://127.0.0.1:3030/status`
- Antworten erscheinen in der Max Console als `STEMDROP_CONNECT`

Der Patch nutzt die einfache `maxurl`-POST-Message. Die Local Helper API akzeptiert dafuer neben JSON auch das von `maxurl` gesendete Form-Format.

## Test

Terminal 1:

```bash
npm run helper
```

Terminal 2:

```bash
STEMDROP_ROOM_CODE=TEST01 STEMDROP_WS_HOST=127.0.0.1 npm run server
```

Dann:

1. `maxforlive/MAXURL_CONNECT_TEST.maxpat` in Max for Live oeffnen.
2. Max Console oeffnen.
3. Connect klicken.
4. Pruefen, ob die POST-Response `ok: true` enthaelt.
5. Pruefen, ob der folgende Status `roomCode: TEST01` und `connectedClients: 1` zeigt.

Wenn der Room Code im Server anders ist, muss der Patch spaeter dynamisch erweitert werden. Dieser Test ist absichtlich minimal und nutzt die Defaults.
