# PDF to Viewer Pipeline

*Last updated: January 2025*

The pipeline transforms a scientific PDF into an interactive web viewer with extracted data.

## Pipeline Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌─────────────┐
│   PDF File  │ ──▶ │  Page Images │ ──▶ │  DeepSeek-OCR     │ ──▶ │  Elements   │
└─────────────┘     └──────────────┘     │  (Text & Layout)  │     │  Detection  │
                                         └───────────────────┘     └─────────────┘
                                                                          │
                    ┌─────────────────────────────────────────────────────┘
                    ▼
        ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
        │ Figure            │     │ Chart Data        │     │ Heading           │
        │ Classification    │     │ Extraction        │     │ Classification    │
        │ (Gemini/Anthropic)│     │ (Gemini 2.5 Pro)  │     │ (Anthropic)       │
        └───────────────────┘     └───────────────────┘     └───────────────────┘
                    │                      │                         │
                    └──────────────────────┼─────────────────────────┘
                                           ▼
                              ┌───────────────────────┐
                              │  Document Assembly    │
                              │  - Markdown           │
                              │  - JSON               │
                              │  - Viewer HTML        │
                              └───────────────────────┘
```

## Step-by-Step Process

### 1. PDF to Images
**Script:** `batch_process.py`
**Tool:** pdf2image (poppler)

- Converts each PDF page to a PNG image at 150 DPI
- Output: `page_images/page_001.png`, `page_002.png`, etc.

### 2. DeepSeek-OCR Processing
**Script:** `batch_process.py`
**Model:** DeepSeek-OCR (deepseek-ai/DeepSeek-OCR)

For each page image:
- Detects document elements: text blocks, images, tables, headings
- Extracts bounding boxes for each element
- Performs OCR on text regions
- Outputs element types: `text`, `image`, `table`, `heading`, `image_caption`, `table_caption`, `table_footnote`

### 3. Figure Classification
**Script:** `batch_process.py` → `classify_figure()`
**Models:** Gemini 2.0 Flash or Anthropic Claude

For each detected image element:
- Sends cropped image to vision model
- Classifies into: `bar_chart`, `line_graph`, `scatter_plot`, `histogram`, `heatmap`, `boxplot`, `pie_chart`, `photograph`, `micrograph`, `diagram`, `flowchart`, `schematic`, `map`, `other`
- Generates brief description

### 4. Chart Data Extraction
**Script:** `chart_extraction.py`
**Model:** Gemini 2.5 Pro

For chart types (`bar_chart`, `line_graph`, `scatter_plot`, `histogram`, `boxplot`):
- Extracts structured data including:
  - Axis labels and ranges
  - Data points (x, y values)
  - Series names and colors
  - Marker styles (type, fill, size)
  - Error bars (vertical/horizontal)
  - Trend/regression lines
- Handles multi-chart figures (e.g., Chart A, Chart B)

### 5. Heading Classification
**Script:** `batch_process.py`
**Model:** Anthropic Claude

- Creates composite image of all headings
- Classifies each heading:
  - **Matter:** front, body, back
  - **Level:** title, section, subsection
- Builds document hierarchy

### 6. Table Extraction
**Script:** `batch_process.py`

- Tables detected by DeepSeek-OCR are extracted as HTML
- Parsed content stored in `parsed_content` field
- Captions and footnotes linked to parent table

### 7. Document Assembly
**Script:** `batch_process.py`

Generates three outputs:

#### a) `processed_document.json`
Complete structured data:
```json
{
  "pages": [
    {
      "sequence_number": 1,
      "elements": [
        {
          "id": 1,
          "raw_type": "image",
          "figure_type": "line_graph",
          "figure_description": "...",
          "chart_data": {...},
          "bounding_boxes": [[x1,y1,x2,y2]],
          "parsed_content": "..."
        }
      ]
    }
  ],
  "sections": [
    {"id": 1, "name": "...", "matter": "front", "level": "title"}
  ]
}
```

#### b) `document.md`
Markdown document with:
- Section hierarchy (headings)
- Text content
- Embedded images: `![](images/fig_p008_00.jpg)`
- Tables as HTML

#### c) `viewer.html`
Interactive viewer with:
- Page thumbnails navigation
- Section tree navigation
- Markdown view
- Element overlays on page images
- Chart replotting with Chart.js
- Data download options

## Generated Artifacts

The pipeline produces the following artifacts:

### Primary Outputs

| Artifact | Description |
|----------|-------------|
| `viewer.html` | Interactive web viewer - self-contained HTML with embedded CSS/JS |
| `processed_document.json` | Complete structured data - pages, elements, sections, chart data |
| `document.md` | Markdown representation of the document with embedded images |

### Image Assets

| Artifact | Description |
|----------|-------------|
| `page_images/page_XXX.png` | Full page renders at 150 DPI (one per PDF page) |
| `images/fig_pXXX_YY.jpg` | Cropped figure images extracted from pages |
| `images/table_pXXX_YY.jpg` | Cropped table images extracted from pages |

### Metadata Files

| Artifact | Description |
|----------|-------------|
| `heading_composite.jpg` | Composite image of all headings (used for classification) |
| `heading_metadata.json` | Raw heading data with bounding boxes and text |
| `heading_classification.json` | Classification results (matter, level) for each heading |

### Data Structures

#### `processed_document.json` contains:
- **pages[]** - Array of page objects with:
  - `sequence_number` - Page number
  - `image_path` - Path to page image
  - `elements[]` - Detected elements on this page

- **elements[]** - Each element includes:
  - `id` - Unique identifier
  - `raw_type` - DeepSeek-OCR type (text, image, table, heading)
  - `bounding_boxes` - Coordinates [[x1,y1,x2,y2]]
  - `figure_type` - Classification (for images): line_graph, bar_chart, etc.
  - `figure_description` - AI-generated description
  - `chart_data` - Extracted data points (for charts)
  - `parsed_content` - HTML content (for tables)
  - `text` - OCR text content

- **sections[]** - Document structure:
  - `id`, `name` - Section identifier and title
  - `matter` - front, body, or back
  - `level` - title, section, or subsection
  - `parent_id` - Hierarchy reference
  - `start_page`, `end_page` - Page range

#### Chart data structure (`chart_data`):
```json
{
  "chart_title": "...",
  "Chart_Type": "Line Graph",
  "x_axis_label": "Temperature (°C)",
  "y_axis_label": "Rate",
  "x_axis_min": 0, "x_axis_max": 100,
  "Left_Y_axis_min": 0, "Left_Y_axis_max": 1,
  "data": [
    {
      "series": "Control",
      "x": 25, "y": 0.5,
      "color": "#0000FF",
      "marker_type": "circle",
      "marker_fill": "filled",
      "marker_size": "medium",
      "line_style": "solid",
      "error_bars": [
        {"error_plus": 0.1, "error_minus": 0.1, "error_direction": "vertical"}
      ]
    }
  ]
}
```

## Output Folder Structure

```
output/
├── viewer.html              # Interactive viewer
├── processed_document.json  # All extracted data
├── document.md              # Generated markdown
├── heading_composite.jpg    # Headings image for classification
├── heading_classification.json
├── heading_metadata.json
├── images/                  # Extracted figures and tables
│   ├── fig_p003_00.jpg
│   ├── fig_p008_00.jpg
│   └── table_p007_00.jpg
└── page_images/             # Full page renders
    ├── page_001.png
    ├── page_002.png
    └── ...
```

## Running the Pipeline

```bash
uv run python -m scripts.batch_process \
  input.pdf \
  -o output/ \
  --extract-chart-data \
  --figure-classification-provider gemini
```

### Key Options:
- `--extract-chart-data`: Enable chart data extraction
- `--figure-classification-provider`: `gemini`, `anthropic`, or `deepseek`
- `--chart-extraction-model`: Model for chart extraction (default: gemini-2.5-pro)
- `--dpi`: Image resolution (default: 150)

## Models Used

| Step | Model | Purpose |
|------|-------|---------|
| OCR & Layout | DeepSeek-OCR | Text extraction, element detection |
| Figure Classification | Gemini 2.0 Flash | Classify image types |
| Chart Extraction | Gemini 2.5 Pro | Extract chart data points |
| Heading Classification | Claude Sonnet | Document structure |

## Viewer Features

The generated `viewer.html` provides:

1. **Page Navigation** - Thumbnail list, prev/next buttons
2. **Section Navigation** - Hierarchical document structure
3. **Markdown View** - Rendered document with images
4. **Element Details** - Click any figure/table to see:
   - Description and classification
   - Chart data (for charts)
   - Replotted chart visualization
   - Download options (JSON, ZIP)
5. **Interactive Charts** - Replotted with Chart.js including:
   - Multiple chart types
   - Error bars
   - Trend lines
   - Per-point marker styles
