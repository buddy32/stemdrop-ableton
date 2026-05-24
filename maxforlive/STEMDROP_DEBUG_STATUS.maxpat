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
    "rect": [100.0, 100.0, 560.0, 260.0],
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
    "description": "StemDrop Node-for-Max debug status patch",
    "digest": "StemDrop Node-for-Max debug status patch",
    "tags": "StemDrop,Node for Max,debug,status",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "text": "StemDrop Debug Status",
          "patching_rect": [30.0, 25.0, 180.0, 20.0],
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
          "patching_rect": [30.0, 75.0, 30.0, 30.0],
          "presentation": 1,
          "presentation_rect": [20.0, 50.0, 30.0, 30.0]
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
          "patching_rect": [90.0, 79.0, 55.0, 22.0],
          "presentation": 1,
          "presentation_rect": [70.0, 54.0, 55.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "newobj",
          "text": "node.script stemdrop_debug_status.js @autostart 1",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [""],
          "patching_rect": [180.0, 79.0, 310.0, 22.0],
          "presentation": 1,
          "presentation_rect": [20.0, 105.0, 310.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "newobj",
          "text": "print STEMDROP_DEBUG_NODE",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [180.0, 125.0, 170.0, 22.0]
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "comment",
          "text": "Wait for \"StemDrop debug JS loaded\" in Max Console, then click.",
          "patching_rect": [30.0, 165.0, 400.0, 20.0],
          "presentation": 1,
          "presentation_rect": [20.0, 145.0, 400.0, 20.0]
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
          "destination": ["obj-4", 0]
        }
      },
      {
        "patchline": {
          "source": ["obj-4", 0],
          "destination": ["obj-5", 0]
        }
      }
    ]
  }
}
