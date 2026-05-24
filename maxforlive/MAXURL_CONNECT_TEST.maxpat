{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "rect": [100.0, 100.0, 820.0, 420.0],
    "bglocked": 0,
    "openinpresentation": 1,
    "default_fontsize": 12.0,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "gridonopen": 1,
    "gridsize": [15.0, 15.0],
    "gridsnaponopen": 1,
    "objectsnaponopen": 1,
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "lefttoolbarpinned": 0,
    "toptoolbarpinned": 0,
    "righttoolbarpinned": 0,
    "bottomtoolbarpinned": 0,
    "toolbars_unpinned_last_save": 0,
    "tallnewobj": 0,
    "boxanimatetime": 200,
    "enablehscroll": 1,
    "enablevscroll": 1,
    "devicewidth": 0.0,
    "description": "StemDrop maxurl connect test",
    "digest": "StemDrop maxurl connect test",
    "tags": "StemDrop,maxurl,connect",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "text": "StemDrop maxurl Connect Test",
          "patching_rect": [30.0, 25.0, 240.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 20.0, 240.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "comment",
          "text": "relayUrl",
          "patching_rect": [30.0, 70.0, 70.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 65.0, 70.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "message",
          "text": "ws://127.0.0.1:8787",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [110.0, 69.0, 170.0, 22.0],
          "presentation": 1,
          "presentation_rect": [95.0, 64.0, 170.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "comment",
          "text": "roomCode",
          "patching_rect": [30.0, 110.0, 70.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 105.0, 70.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "message",
          "text": "TEST01",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [110.0, 109.0, 80.0, 22.0],
          "presentation": 1,
          "presentation_rect": [95.0, 104.0, 80.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "button",
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [30.0, 160.0, 30.0, 30.0],
          "presentation": 1,
          "presentation_rect": [20.0, 150.0, 30.0, 30.0]
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "message",
          "text": "Connect",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [75.0, 164.0, 70.0, 22.0],
          "presentation": 1,
          "presentation_rect": [65.0, 154.0, 70.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "newobj",
          "text": "t b b",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": ["bang", "bang"],
          "patching_rect": [170.0, 164.0, 45.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "message",
          "text": "post http://127.0.0.1:3030/connect relayUrl ws://127.0.0.1:8787 roomCode TEST01",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [235.0, 135.0, 520.0, 22.0],
          "presentation": 1,
          "presentation_rect": [235.0, 154.0, 520.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "newobj",
          "text": "maxurl",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": ["", ""],
          "patching_rect": [430.0, 220.0, 55.0, 22.0],
          "presentation": 1,
          "presentation_rect": [165.0, 154.0, 55.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "newobj",
          "text": "print STEMDROP_CONNECT",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [510.0, 220.0, 165.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "message",
          "text": "get http://127.0.0.1:3030/status",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [430.0, 285.0, 230.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "newobj",
          "text": "delay 500",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [235.0, 285.0, 70.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "comment",
          "text": "Uses defaults above. Response and follow-up /status are printed to Max Console.",
          "patching_rect": [30.0, 225.0, 520.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 205.0, 520.0, 20.0]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": ["obj-6", 0],
          "destination": ["obj-7", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-7", 0],
          "destination": ["obj-8", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-8", 1],
          "destination": ["obj-9", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-9", 0],
          "destination": ["obj-12", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-12", 0],
          "destination": ["obj-13", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-12", 1],
          "destination": ["obj-13", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-8", 0],
          "destination": ["obj-15", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-15", 0],
          "destination": ["obj-14", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-14", 0],
          "destination": ["obj-12", 0]
        }
      }
    ]
  }
}
