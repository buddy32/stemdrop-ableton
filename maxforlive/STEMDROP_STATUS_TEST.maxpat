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
    "rect": [100.0, 100.0, 760.0, 420.0],
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
    "description": "StemDrop Local Helper status test",
    "digest": "StemDrop Local Helper status test",
    "tags": "StemDrop,Max for Live,status",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "text": "StemDrop Status Test",
          "patching_rect": [30.0, 25.0, 200.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 15.0, 180.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "button",
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [30.0, 70.0, 32.0, 32.0],
          "presentation": 1,
          "presentation_rect": [20.0, 45.0, 32.0, 32.0]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "message",
          "text": "status",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [90.0, 75.0, 55.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "newobj",
          "text": "node.script stemdrop_status_test.js",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [180.0, 75.0, 220.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "newobj",
          "text": "route ready status_json online roomCode connectedClients error",
          "numinlets": 1,
          "numoutlets": 7,
          "outlettype": ["", "", "", "", "", "", ""],
          "patching_rect": [180.0, 125.0, 405.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "newobj",
          "text": "print STEMDROP_STATUS",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [30.0, 175.0, 150.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "toggle",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": ["int"],
          "patching_rect": [225.0, 175.0, 24.0, 24.0],
          "presentation": 1,
          "presentation_rect": [95.0, 50.0, 24.0, 24.0]
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "comment",
          "text": "online",
          "patching_rect": [255.0, 178.0, 60.0, 20.0],
          "presentation": 1,
          "presentation_rect": [125.0, 52.0, 60.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "message",
          "text": "-",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [320.0, 175.0, 100.0, 22.0],
          "presentation": 1,
          "presentation_rect": [20.0, 95.0, 120.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "comment",
          "text": "roomCode",
          "patching_rect": [430.0, 178.0, 80.0, 20.0],
          "presentation": 1,
          "presentation_rect": [150.0, 97.0, 80.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "number",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": ["", "bang"],
          "patching_rect": [530.0, 175.0, 50.0, 22.0],
          "presentation": 1,
          "presentation_rect": [20.0, 135.0, 50.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "comment",
          "text": "connectedClients",
          "patching_rect": [590.0, 178.0, 120.0, 20.0],
          "presentation": 1,
          "presentation_rect": [80.0, 137.0, 120.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "comment",
          "text": "Click button after ready to GET http://127.0.0.1:3030/status",
          "patching_rect": [30.0, 235.0, 360.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 175.0, 360.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "newobj",
          "text": "gate 1 0",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [90.0, 110.0, 60.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "newobj",
          "text": "loadbang",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [440.0, 35.0, 65.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "message",
          "text": "script start",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [440.0, 75.0, 80.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "newobj",
          "text": "t b anything",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": ["bang", ""],
          "patching_rect": [30.0, 150.0, 90.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "message",
          "text": "status response received",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [30.0, 205.0, 165.0, 22.0]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": ["obj-2", 0],
          "destination": ["obj-14", 1]
        }
      },
      {
        "patchline": {
          "source": ["obj-14", 0],
          "destination": ["obj-3", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-3", 0],
          "destination": ["obj-4", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-4", 0],
          "destination": ["obj-5", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 0],
          "destination": ["obj-14", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 1],
          "destination": ["obj-17", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 2],
          "destination": ["obj-7", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 3],
          "destination": ["obj-9", 1]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 4],
          "destination": ["obj-11", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-5", 5],
          "destination": ["obj-6", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-15", 0],
          "destination": ["obj-16", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-16", 0],
          "destination": ["obj-4", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-17", 0],
          "destination": ["obj-18", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-17", 1],
          "destination": ["obj-6", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-18", 0],
          "destination": ["obj-6", 0]
        }
      }
    ]
  }
}
