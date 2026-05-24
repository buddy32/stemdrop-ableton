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
    "rect": [100.0, 100.0, 420.0, 220.0],
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
    "description": "Minimal Node for Max test",
    "digest": "Minimal Node for Max test",
    "tags": "Node for Max,test",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "text": "Node for Max Minimal Test",
          "patching_rect": [30.0, 20.0, 200.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 15.0, 200.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "button",
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [30.0, 160.0, 30.0, 30.0],
          "presentation": 1,
          "presentation_rect": [20.0, 155.0, 30.0, 30.0]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "message",
          "text": "ping",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [80.0, 164.0, 45.0, 22.0],
          "presentation": 1,
          "presentation_rect": [70.0, 159.0, 45.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "newobj",
          "text": "node.script /Users/markuss/Desktop/StemDrop-Ableton/maxforlive/node_test.js @autostart 1",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [30.0, 95.0, 560.0, 22.0],
          "presentation": 1,
          "presentation_rect": [20.0, 95.0, 620.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "comment",
          "text": "Wait for NODE TEST LOADED. Ping opens only after ready.",
          "patching_rect": [30.0, 210.0, 420.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 210.0, 420.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "newobj",
          "text": "loadbang",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [30.0, 55.0, 65.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "message",
          "text": "script start",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [130.0, 55.0, 90.0, 28.0],
          "presentation": 1,
          "presentation_rect": [20.0, 55.0, 100.0, 30.0]
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "newobj",
          "text": "delay 500",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": ["bang"],
          "patching_rect": [30.0, 75.0, 70.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "comment",
          "text": "1. click START NODE",
          "patching_rect": [235.0, 59.0, 150.0, 20.0],
          "presentation": 1,
          "presentation_rect": [135.0, 60.0, 150.0, 20.0]
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "newobj",
          "text": "gate 1 0",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [150.0, 160.0, 60.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "newobj",
          "text": "route ready",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": ["", ""],
          "patching_rect": [610.0, 95.0, 75.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "comment",
          "text": "2. after NODE TEST LOADED, click ping",
          "patching_rect": [135.0, 164.0, 245.0, 20.0],
          "presentation": 1,
          "presentation_rect": [130.0, 160.0, 245.0, 20.0]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": ["obj-2", 0],
          "destination": ["obj-3", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-3", 0],
          "destination": ["obj-10", 1]
        }
      },
      {
        "patchline": {
          "source": ["obj-10", 0],
          "destination": ["obj-4", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-6", 0],
          "destination": ["obj-8", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-8", 0],
          "destination": ["obj-7", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-7", 0],
          "destination": ["obj-4", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-4", 0],
          "destination": ["obj-11", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-11", 0],
          "destination": ["obj-10", 0]
        }
      }
    ]
  }
}
