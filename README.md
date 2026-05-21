# Premium Promo Video Studio - MVP

A local web app for turning a manually recorded Screenity/OBS demo video into a polished advertisement video for websites, software tools, and digital products.

This MVP intentionally does **not** use Playwright/browser automation. You record your website or software demo separately, upload the screen recording, add scene captions, and render a final MP4 using Remotion.

## What this first version includes

- Flask web UI
- Screen recording upload
- Optional voiceover upload
- Optional logo upload
- Scene/caption table
- Scene-level visual controls for background, device, angle, animation, screen zoom, transition, and caption style
- Browser preview page for quick screen recording without full MP4 export
- Project JSON storage
- Three output formats:
  - Vertical 9:16
  - Landscape 16:9
  - Square 1:1
- Three templates:
  - Lifestyle tablet ad
  - Tablet website demo
  - Laptop SaaS demo
  - Phone app demo
- Remotion renderer scaffold
- MP4 output export

## What is intentionally skipped for this MVP

- Browser automation
- Auto selector discovery
- Playwright recording/replay
- Built-in TTS generation
- Multi-template marketplace/editor
- Async background render queue

Those can be added after this local MVP is working.

## Requirements

Install these first:

- Python 3.10+
- Node.js 20+
- npm

## Setup

From the project root:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Mac/Linux:

```bash
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Remotion dependencies:

```bash
cd remotion
npm install
cd ..
```

Start the app:

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5055
```

## Basic usage

1. Record your app/website using Screenity or OBS.
2. Open the local app.
3. Enter project title, product name, CTA, and URL.
4. Upload the screen recording.
5. Add scenes with start/end times and captions.
6. Pick scene backgrounds, devices, angles, animation presets, zoom, transitions, and caption styles.
7. Save project.
8. Open **Preview** for fast browser playback, or click **Render MP4** for a final Remotion export.
9. Open the rendered video from the Projects panel.

## Folder structure

```text
premium-promo-video-studio/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
├── static/
│   ├── app.js
│   └── style.css
├── projects/
│   └── <project-id>/
│       ├── project.json
│       ├── remotion-props.json
│       └── render.log
├── outputs/
│   └── <project-id>.mp4
└── remotion/
    ├── package.json
    ├── remotion.config.ts
    ├── public/
    │   └── projects/
    │       └── <project-id>/
    │           ├── screen.mp4
    │           ├── voiceover.mp3
    │           └── logo.png
    └── src/
        ├── index.ts
        ├── Root.tsx
        └── PromoVideo.tsx
```

## Notes

- Rendering is synchronous in this MVP. For large videos, the browser may look busy until rendering finishes.
- Remotion compositions now resolve duration from each project, capped between 5 and 120 seconds.
- The default Lifestyle tablet ad template uses `remotion/public/assets/lifestyle-reading-room.png` as a warm desk/reading-room background.
- The screen recording is muted in the final render. Upload a separate voiceover if you want narration.
- For best results, record a clean screen video without browser tabs/toolbars when possible.

## Next improvements

Recommended next development steps:

1. Add built-in TTS generation from narration text.
2. Add background music upload.
3. Add custom background upload and thumbnail generation.
4. Add asynchronous render queue.
5. Add batch import from CSV/Excel.
6. Add thumbnail export.
7. Add YouTube Shorts metadata generation.
