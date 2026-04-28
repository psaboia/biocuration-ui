# Biocuration UI

A browser-based viewer for annotated scientific documents, with chart data extraction and VecTraits biocuration support.

## Setup

1. Open `viewer.html` in a browser (or serve the folder with a local HTTP server).
2. Load a processed document JSON when prompted.

## AI / VecTraits mapping (optional)

The VecTraits tab uses OpenAI to automatically map chart data to VecTraits database fields.

1. Copy `config.local.example.json` to `config.local.json`.
2. Replace `sk-...` with your OpenAI API key.
3. Reload the viewer — charts will be analysed in the background.

`config.local.json` is git-ignored and never committed.

## Exporting VecTraits CSV

- **Single chart:** open a chart element → VecTraits tab → *Download VecTraits CSV*.
- **All charts:** click *Download All* in the toolbar once AI mapping is complete.
