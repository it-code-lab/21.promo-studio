# Premium Promo Video Studio

A local web app for turning website, SaaS, and software screen recordings into polished advertisement videos.

The workflow is preview-first: upload a screen recording, optionally upload voiceover/background music, generate or edit captions, choose device/background/camera styling, preview the video in the browser, then render an MP4 with Remotion.

## Features

- Local Flask studio UI
- Project-based workflow with saved JSON metadata
- Screen recording upload
- Optional voiceover upload
- Optional background music upload
- Optional logo upload
- Voiceover transcription with word-level timestamps using `faster-whisper`
- Premium browser preview with:
  - realistic device frames
  - background scenes
  - camera zoom/pan motion
  - word-level caption highlighting
  - caption style thumbnails
  - caption position, size, words-per-screen, and highlight controls
  - voice/music volume controls
  - playback speed controls
  - clean view for screen recording
  - keyboard shortcuts
- Scene visual controls:
  - global scene look applied to every scene by default
  - background
  - device
  - angle
  - camera animation
  - animation amount
  - screen zoom
  - transition
- Timeline clips:
  - device-screen clips
  - full-screen clips
  - background clips
  - overlay clips
- Async Remotion MP4 rendering with progress polling
- Three output formats:
  - vertical 9:16
  - landscape 16:9
  - square 1:1
- Project deletion for cleanup

## Requirements

Install these first:

- Python 3.10+
- Node.js 20+
- npm
- FFmpeg / FFprobe available on `PATH`

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

## User Guide

### 1. Record Your Product

Record your website or software tool with Screenity, OBS, Loom, or another screen recorder.

Tips:

- Record a clean product walkthrough.
- Avoid unnecessary browser chrome when possible.
- For mobile-style videos, a vertical screen recording usually works best.
- For SaaS demos, landscape or vertical can both work depending on the target platform.

### 2. Create a Project

On the Studio page:

1. Enter the project title.
2. Enter product name, target URL, and CTA.
3. Choose output format: vertical, landscape, or square.
4. Upload the screen recording.
5. Optionally upload voiceover, background music, and logo.

If voiceover audio is uploaded, the project duration is based on the voiceover length.

### 3. Generate Captions From Voiceover

After choosing a voiceover file, click **Generate from voiceover**.

The app uses `faster-whisper` locally to:

- transcribe the voiceover
- split transcript text into paced scenes
- store word-level timings
- generate caption timing for preview and render

The first transcription may take longer while the local model loads.

Use **Scene pacing** before generating captions to control how fast scene visuals change:

- **Minimum** prevents tiny transcript fragments from becoming standalone scenes.
- **Preferred** is the target scene length for most caption groups.
- **Maximum** prevents any merged transcript scene from running too long.

After captions are generated, **Rebuild scene lengths** can merge existing short scenes using the same pacing controls while preserving word-level voiceover timings.

### 4. Edit Scenes

Scenes define the main timeline. Each scene has:

- start time
- end time
- caption text
- narration/notes

You can add scenes manually, insert a scene after another scene, delete scenes, and drag scenes to reorder them.

Use **Reflow timings by order** when you only want to make existing scene timings continuous. Use **Rebuild scene lengths** when transcript scenes are too short and should be merged into calmer visual chunks.

Scene visual overrides are collapsed by default to keep the UI clean. Expand **Scene visual overrides** when you want a scene-specific background, device, angle, motion, transition, or caption override.

### 5. Choose Global Scene Look

Most videos should use one consistent visual language. Use **Global scene look** to set the default:

- background
- device
- angle
- camera animation
- animation amount
- transition
- screen zoom

Background, device, angle, animation, and transition can be left as **Per scene**. In that mode, each scene keeps its own saved setting. Choosing a specific global value applies it to every scene unless **Override global scene look for this scene** is enabled inside a scene.

### 6. Choose Global Caption Style

Most videos should use one caption style throughout. Use the global caption controls for:

- caption style
- caption position
- caption size
- caption accent

Scene-level caption overrides are available only when needed.

### 7. Add Timeline Clips

Timeline clips are optional. They can be inserted at different points in the sequence.

Clip modes:

- **Device screen**: replaces the screen recording inside the device.
- **Full screen**: covers the full video stage.
- **Background**: replaces the scene background.
- **Overlay**: appears as a picture-in-picture style clip.

You do not need to manually provide exact start/end times for basic clip insertion. Use the placement and duration controls to position clips in the timeline.

### 8. Save the Project

Click **Save Project**. The project appears in the Projects panel.

Project files are stored under:

```text
projects/<project-id>/project.json
```

Uploaded media is copied to:

```text
remotion/public/projects/<project-id>/
```

### 9. Preview the Video

Open **Preview** from the Projects panel.

The preview page is designed for fast creative iteration and screen recording. It includes:

- play, pause, resume, stop, replay
- scrubber
- speed control
- clean view
- record-ready countdown
- caption style thumbnails
- words-per-screen control
- caption position and size controls
- word highlight modes
- voiceover/music volume controls
- render button

Preview caption/audio/speed settings are saved back into the project and passed to Remotion rendering.

### 10. Keyboard Shortcuts

On the preview page:

| Shortcut | Action |
| --- | --- |
| `Space` or `K` | Play / pause / resume |
| `C` | Toggle clean view |
| `R` | Replay |
| `Shift + R` | Record-ready countdown |
| `S` | Stop |
| `Esc` | Exit clean view |

### 11. Render MP4

You can render from either:

- the Studio Projects panel
- the Preview page

Rendering is asynchronous. The app starts a background Remotion render and then polls progress.

Progress phases include:

- queued
- bundling
- copying public dir
- rendering
- encoding
- done

Rendered files are saved to:

```text
outputs/<project-id>.mp4
```

When render finishes, the MP4 link appears in the UI.

## Preview vs Render

The app is being moved toward a shared preview/render visual model.

Currently shared between preview and render:

- saved preview settings
- caption style
- caption position
- caption size
- words per caption group
- word-level timing
- highlight mode
- voice/music enable flags
- voice/music volume
- playback speed
- device layout rules
- background/device/camera scene choices
- timeline clips

Small visual differences may still exist because browser CSS/canvas preview and Remotion rendering are not fully the same engine yet. The main remaining differences are usually fine visual details such as shadows, exact CSS compositing, and some transition polish.

## Rendering Performance

Rendering long videos can take time. A 2-minute video may take several minutes depending on:

- screen recording resolution
- output format
- caption complexity
- device/background effects
- CPU/GPU performance
- Remotion/Chromium render speed

The render now runs asynchronously, so the UI does not block while export is running.

Possible future speed improvements:

- draft/fast render mode
- lower-resolution preview export
- configurable concurrency
- render presets for social drafts vs final production
- pre-rendered background/device layers

## Folder Structure

```text
premium-promo-video-studio/
├── app.py
├── requirements.txt
├── templates/
│   ├── index.html
│   └── preview.html
├── static/
│   ├── app.js
│   ├── preview.js
│   ├── preview.css
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
    │   ├── assets/
    │   └── projects/
    │       └── <project-id>/
    │           ├── screen.mp4
    │           ├── voiceover.wav
    │           ├── background-music.mp3
    │           ├── logo.png
    │           └── clips/
    └── src/
        ├── index.ts
        ├── Root.tsx
        └── PromoVideo.tsx
```

## API Reference

Main local endpoints:

- `GET /`
  - Studio UI.
- `GET /preview/<project-id>`
  - Browser preview UI.
- `GET /api/projects`
  - List projects.
- `POST /api/projects`
  - Create/save a project with uploaded media.
- `GET /api/projects/<project-id>`
  - Read one project.
- `PATCH /api/projects/<project-id>/preview-settings`
  - Save preview caption/audio/speed settings.
- `POST /api/projects/<project-id>/render`
  - Start async Remotion render.
- `GET /api/projects/<project-id>/render-status`
  - Poll render progress.
- `DELETE /api/projects/<project-id>`
  - Delete project, assets, and rendered MP4.
- `POST /api/transcribe`
  - Transcribe uploaded voiceover into timed scenes.

## Troubleshooting

### Render Is Slow

This is expected for longer videos. Use the progress indicator to monitor render phase. Future work can add draft-quality exports for faster iteration.

### Preview Looks Different From Render

The preview and Remotion render are being aligned, but small visual differences can still occur. Re-render after changing preview caption/audio/speed settings.

### Captions Are Estimated Instead of Word-Timed

Upload a voiceover and run **Generate from voiceover**. Word-level highlighting depends on transcript word timings.

### Voiceover Does Not Play In Preview

Browsers may block audio until user interaction. Click **Play** on the preview page.

### Render Fails

Check:

- Remotion dependencies are installed under `remotion/node_modules`.
- FFmpeg/FFprobe are available.
- Uploaded files exist under `remotion/public/projects/<project-id>/`.
- The project render log exists at `projects/<project-id>/render.log`.

## Notes

- This is a local-first app. It does not require browser automation.
- The screen recording is muted in render. Use voiceover/background music for audio.
- Project cleanup is available through the Delete button in the Projects panel.
- Background images are stored in `remotion/public/assets/`.
- The current maximum project duration is 600 seconds.

## Recommended Next Improvements

1. Add draft/final render presets.
2. Add configurable render quality and concurrency.
3. Add custom background upload with thumbnail generation.
4. Add built-in TTS generation.
5. Add caption style marketplace/preset packs.
6. Add project duplication.
7. Add thumbnail/poster export.
8. Add batch project generation from CSV.
