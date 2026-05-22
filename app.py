from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

from flask import Flask, abort, jsonify, render_template, request, send_from_directory
from slugify import slugify
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = BASE_DIR / "projects"
OUTPUTS_DIR = BASE_DIR / "outputs"
REMOTION_DIR = BASE_DIR / "remotion"
REMOTION_PUBLIC_DIR = REMOTION_DIR / "public"
REMOTION_PUBLIC_PROJECTS = REMOTION_DIR / "public" / "projects"

ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov", "webm", "mkv"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "m4a", "aac", "ogg"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
CLIP_MODES = {"device-screen", "full-screen", "background", "overlay"}

DEFAULT_SCENE_DESIGN: dict[str, Any] = {
    "background": "reading-room",
    "device": "tablet-pro",
    "angle": "low-desk-left",
    "motion": "slow-push-in",
    "motionAmount": 2.2,
    "screenZoom": 1,
    "transition": "soft-fade",
    "captionStyle": "white-chip",
    "captionPosition": "auto",
    "captionAnimation": "none",
    "captionSize": "standard",
    "captionAccent": "none",
    "captionAnimationAmount": 1.4,
}

CAPTION_STYLE_PRESETS = [
    "white-chip",
    "glass-card",
    "bold-bottom",
    "editorial-card",
    "neon-ribbon",
    "kinetic-stack",
    "minimal-subtitle",
    "device-callout",
]

BACKGROUND_PRESETS = [
    "reading-room",
    "office-desk",
    "cafe-table",
    "dark-studio",
    "home-office",
    "classroom",
    "meeting-room",
    "evening-desk",
    "kitchen-counter",
    "creator-studio",
]

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024  # 2GB for screen recordings

for path in [PROJECTS_DIR, OUTPUTS_DIR, REMOTION_PUBLIC_PROJECTS]:
    path.mkdir(parents=True, exist_ok=True)


def file_ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed(filename: str, allowed: set[str]) -> bool:
    return file_ext(filename) in allowed


def now_id() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def read_project(project_id: str) -> dict[str, Any]:
    project_file = PROJECTS_DIR / project_id / "project.json"
    if not project_file.exists():
        raise FileNotFoundError(f"Project not found: {project_id}")
    return normalize_project(json.loads(project_file.read_text(encoding="utf-8")))


def write_project(project_id: str, data: dict[str, Any]) -> None:
    project_dir = PROJECTS_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "project.json").write_text(json.dumps(data, indent=2), encoding="utf-8")


def child_path(root: Path, *parts: str) -> Path:
    root_resolved = root.resolve()
    target = (root / Path(*parts)).resolve()
    if target != root_resolved and root_resolved not in target.parents:
        raise ValueError("Resolved path is outside the expected directory.")
    return target


def normalize_project(project: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(project)
    normalized_assets = dict(normalized.get("assets", {})) if isinstance(normalized.get("assets"), dict) else {}
    screen_info = screen_asset_info(normalized_assets)
    if screen_info:
        normalized_assets.setdefault("screenDurationSeconds", screen_info.get("duration"))
        normalized_assets.setdefault("screenWidth", screen_info.get("width"))
        normalized_assets.setdefault("screenHeight", screen_info.get("height"))
        normalized["assets"] = normalized_assets
    scenes = normalized.get("scenes", [])
    if isinstance(scenes, list):
        normalized["scenes"] = [
            with_scene_design(scene, index) if isinstance(scene, dict) else scene
            for index, scene in enumerate(scenes)
        ]
    if normalized.get("template") in {None, "tablet", "laptop", "phone"}:
        normalized["template"] = "lifestyle"
    clips = normalized.get("clips", [])
    normalized["clips"] = normalize_clips(clips) if isinstance(clips, list) else []
    return normalized


def screen_asset_info(assets: dict[str, Any]) -> dict[str, Any] | None:
    if assets.get("screenWidth") and assets.get("screenHeight"):
        return {
            "duration": assets.get("screenDurationSeconds"),
            "width": assets.get("screenWidth"),
            "height": assets.get("screenHeight"),
        }
    screen_asset = str(assets.get("screen") or "")
    if not screen_asset:
        return None
    screen_path = REMOTION_PUBLIC_DIR / screen_asset
    if not screen_path.exists():
        return None
    return probe_media_info(screen_path)


def normalize_clips(clips: list[Any]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for clip in clips:
        if not isinstance(clip, dict):
            continue
        try:
            start = max(0.0, float(clip.get("start", 0) or 0))
            end = max(start, float(clip.get("end", 0) or 0))
        except (TypeError, ValueError):
            continue
        asset = str(clip.get("asset") or "").strip()
        mode = str(clip.get("mode") or "device-screen")
        if not asset or end <= start:
            continue
        normalized.append({
            "start": round(start, 3),
            "end": round(end, 3),
            "mode": mode if mode in CLIP_MODES else "device-screen",
            "label": str(clip.get("label") or "Clip").strip()[:120],
            "asset": asset,
            "durationSeconds": clip.get("durationSeconds"),
        })
    return normalized


def save_upload(file_storage, destination_dir: Path, prefix: str, allowed: set[str]) -> str | None:
    if not file_storage or not file_storage.filename:
        return None
    original = secure_filename(file_storage.filename)
    if not original or not is_allowed(original, allowed):
        raise ValueError(f"Unsupported file type: {original}")
    ext = file_ext(original)
    filename = f"{prefix}.{ext}"
    destination_dir.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination_dir / filename)
    return filename


def save_clip_upload(file_storage, destination_dir: Path, index: int) -> str:
    if not file_storage or not file_storage.filename:
        raise ValueError("Clip row is missing a video file.")
    original = secure_filename(file_storage.filename)
    if not original or not is_allowed(original, ALLOWED_VIDEO_EXTENSIONS):
        raise ValueError(f"Unsupported clip file type: {original}")
    ext = file_ext(original)
    filename = f"clip_{index:02d}.{ext}"
    destination_dir.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination_dir / filename)
    return filename


def probe_media_duration(path: Path) -> float | None:
    info = probe_media_info(path)
    return info.get("duration") if info else None


def probe_media_info(path: Path) -> dict[str, Any] | None:
    ffprobe = "ffprobe.exe" if os.name == "nt" else "ffprobe"
    try:
        proc = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height:format=duration",
                "-of",
                "json",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=20,
        )
        if proc.returncode != 0:
            return None
        data = json.loads(proc.stdout or "{}")
        stream = (data.get("streams") or [{}])[0]
        duration = data.get("format", {}).get("duration")
        return {
            "duration": round(float(duration), 3) if duration not in {None, "N/A"} else None,
            "width": int(stream.get("width") or 0) or None,
            "height": int(stream.get("height") or 0) or None,
        }
    except Exception:
        return None


def with_scene_design(scene: dict[str, Any], index: int) -> dict[str, Any]:
    defaults = {
        **DEFAULT_SCENE_DESIGN,
        "background": BACKGROUND_PRESETS[index % len(BACKGROUND_PRESETS)],
        "device": ["tablet-pro", "laptop-silver", "phone-modern", "browser-window"][index % 4],
        "angle": ["low-desk-left", "front-center", "floating-hero", "low-desk-right"][index % 4],
        "motion": ["slow-push-in", "screen-focus", "device-tilt", "pan-left"][index % 4],
        "motionAmount": [2.2, 2.2, 2.2, 2.2][index % 4],
        "screenZoom": 1,
        "transition": ["soft-fade", "soft-fade", "slide-up", "clean-cut"][index % 4],
        "captionStyle": CAPTION_STYLE_PRESETS[index % len(CAPTION_STYLE_PRESETS)],
        "captionPosition": ["top", "top", "top", "bottom", "bottom", "device"][index % 6],
        "captionAnimation": "none",
        "captionSize": ["large", "standard", "compact", "hero", "standard", "large"][index % 6],
        "captionAccent": ["last-word", "none", "first-word", "last-word", "none", "first-word"][index % 6],
        "captionAnimationAmount": 1.4,
    }
    return {**defaults, **scene}


def caption_text(text: str, max_chars: int = 38) -> str:
    words = text.strip().split()
    if not words:
        return ""
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join([*current, word])
        if current and len(candidate) > max_chars:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return "\n".join(lines[:2])


def transcript_word_dict(word: Any, scene_start: float, scene_end: float) -> dict[str, Any] | None:
    word_text = " ".join(str(getattr(word, "word", "") or "").split())
    if not word_text:
        return None
    word_start = max(scene_start, float(getattr(word, "start", scene_start) or scene_start))
    word_end = min(scene_end, float(getattr(word, "end", word_start + 0.2) or word_start + 0.2))
    return {
        "text": word_text,
        "start": round(word_start, 3),
        "end": round(max(word_start + 0.04, word_end), 3),
        "source": "voiceover",
    }


def transcribe_audio_to_scenes(audio_path: Path, duration_seconds: float) -> list[dict[str, Any]]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "Local transcription requires faster-whisper. Install it with: pip install faster-whisper"
        ) from exc

    model_name = os.environ.get("PROMO_STUDIO_WHISPER_MODEL", "base")
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(str(audio_path), vad_filter=True, word_timestamps=True)

    scenes: list[dict[str, Any]] = []
    for segment in segments:
        text = " ".join(str(segment.text or "").split())
        if not text:
            continue
        start = max(0.0, float(segment.start))
        if duration_seconds > 0 and start >= duration_seconds:
            continue
        end = max(start + 0.35, float(segment.end))
        if duration_seconds > 0:
            end = min(end, duration_seconds)
        if end <= start:
            continue
        words: list[dict[str, Any]] = []
        for word in getattr(segment, "words", None) or []:
            word_data = transcript_word_dict(word, start, end)
            if word_data:
                words.append(word_data)
        scenes.append({
            "start": round(start, 2),
            "end": round(end, 2),
            "caption": caption_text(text),
            "narration": text,
            "words": words,
            "wordTimingSource": "voiceover" if words else "estimated",
        })

    if not scenes:
        raise RuntimeError("No speech was detected in the uploaded audio.")
    return [with_scene_design(scene, index) for index, scene in enumerate(scenes)]


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/preview/<project_id>")
def preview_project(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        abort(404)
    static_version = int(max(
        (BASE_DIR / "static" / "preview.js").stat().st_mtime,
        (BASE_DIR / "static" / "preview.css").stat().st_mtime,
    ))
    return render_template("preview.html", project=project, static_version=static_version)


@app.get("/api/projects")
def list_projects():
    projects: list[dict[str, Any]] = []
    for project_json in sorted(PROJECTS_DIR.glob("*/project.json"), reverse=True):
        try:
            data = json.loads(project_json.read_text(encoding="utf-8"))
            projects.append({
                "id": data.get("id"),
                "title": data.get("title"),
                "productName": data.get("productName"),
                "format": data.get("format"),
                "template": data.get("template"),
                "status": data.get("status", "draft"),
                "createdAt": data.get("createdAt"),
                "outputUrl": data.get("outputUrl"),
            })
        except Exception:
            continue
    return jsonify({"projects": projects})


@app.post("/api/projects")
def create_project():
    try:
        title = request.form.get("title", "Untitled Promo").strip() or "Untitled Promo"
        product_name = request.form.get("productName", title).strip() or title
        target_url = request.form.get("targetUrl", "").strip()
        cta = request.form.get("cta", "Try it free").strip() or "Try it free"
        video_format = request.form.get("format", "vertical")
        template_name = request.form.get("template", "lifestyle")
        duration_seconds = int(float(request.form.get("durationSeconds", "30") or "30"))
        duration_seconds = max(5, min(duration_seconds, 120))

        try:
            scenes = json.loads(request.form.get("scenes", "[]"))
        except json.JSONDecodeError:
            return jsonify({"error": "Scenes JSON is invalid."}), 400
        try:
            clip_rows = json.loads(request.form.get("clips", "[]"))
        except json.JSONDecodeError:
            return jsonify({"error": "Clips JSON is invalid."}), 400

        if not scenes:
            scenes = [
                {"start": 0, "end": 5, "caption": f"{product_name}\njust got smarter", "narration": f"{product_name} just got smarter."},
                {"start": 5, "end": 11, "caption": "show the real product experience", "narration": "Show the real product experience from your own screen recording."},
                {"start": 11, "end": 18, "caption": "highlight the moments that matter", "narration": "Highlight the moments that matter with polished captions and motion."},
                {"start": 18, "end": 24, "caption": "turn walkthroughs into ads", "narration": "Turn everyday walkthroughs into polished advertisement videos."},
                {"start": 24, "end": 30, "caption": cta, "narration": cta},
            ]
        screen_recording = request.files.get("screenRecording")
        if not screen_recording or not screen_recording.filename:
            return jsonify({"error": "Please upload a screen recording video."}), 400

        project_id = f"{now_id()}_{slugify(title)[:60] or 'promo'}"
        project_dir = PROJECTS_DIR / project_id
        public_dir = REMOTION_PUBLIC_PROJECTS / project_id
        project_dir.mkdir(parents=True, exist_ok=True)
        public_dir.mkdir(parents=True, exist_ok=True)

        screen_filename = save_upload(screen_recording, public_dir, "screen", ALLOWED_VIDEO_EXTENSIONS)
        screen_info = probe_media_info(public_dir / screen_filename) if screen_filename else None
        scenes = [with_scene_design(scene, index) for index, scene in enumerate(scenes)]
        voiceover_filename = save_upload(request.files.get("voiceover"), public_dir, "voiceover", ALLOWED_AUDIO_EXTENSIONS)
        background_music_filename = save_upload(request.files.get("backgroundMusic"), public_dir, "background-music", ALLOWED_AUDIO_EXTENSIONS)
        logo_filename = save_upload(request.files.get("logo"), public_dir, "logo", ALLOWED_IMAGE_EXTENSIONS)
        clips: list[dict[str, Any]] = []
        if isinstance(clip_rows, list):
            clips_dir = public_dir / "clips"
            for index, clip in enumerate(clip_rows, start=1):
                if not isinstance(clip, dict):
                    continue
                file_field = str(clip.get("fileField") or "")
                clip_file = request.files.get(file_field)
                if not clip_file or not clip_file.filename:
                    continue
                clip_filename = save_clip_upload(clip_file, clips_dir, index)
                try:
                    start = max(0.0, float(clip.get("start", 0) or 0))
                    end = max(start, float(clip.get("end", 0) or 0))
                except (TypeError, ValueError):
                    continue
                if end <= start:
                    continue
                mode = str(clip.get("mode") or "device-screen")
                asset = f"projects/{project_id}/clips/{clip_filename}"
                clips.append({
                    "start": round(start, 3),
                    "end": round(end, 3),
                    "mode": mode if mode in CLIP_MODES else "device-screen",
                    "label": str(clip.get("label") or clip_file.filename or "Clip").strip()[:120],
                    "asset": asset,
                    "durationSeconds": probe_media_duration(REMOTION_PUBLIC_DIR / asset),
                })

        project: dict[str, Any] = {
            "id": project_id,
            "title": title,
            "productName": product_name,
            "targetUrl": target_url,
            "cta": cta,
            "format": video_format,
            "template": template_name,
            "durationSeconds": duration_seconds,
            "fps": 30,
            "status": "draft",
            "createdAt": datetime.now().isoformat(timespec="seconds"),
            "assets": {
                "screen": f"projects/{project_id}/{screen_filename}",
                "screenDurationSeconds": screen_info.get("duration") if screen_info else None,
                "screenWidth": screen_info.get("width") if screen_info else None,
                "screenHeight": screen_info.get("height") if screen_info else None,
                "voiceover": f"projects/{project_id}/{voiceover_filename}" if voiceover_filename else None,
                "backgroundMusic": f"projects/{project_id}/{background_music_filename}" if background_music_filename else None,
                "logo": f"projects/{project_id}/{logo_filename}" if logo_filename else None,
            },
            "scenes": scenes,
            "clips": normalize_clips(clips),
            "render": {
                "lastStartedAt": None,
                "lastFinishedAt": None,
                "lastError": None,
                "logFile": None,
            },
        }
        write_project(project_id, project)
        return jsonify({"project": project})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Could not create project: {exc}"}), 500


@app.get("/api/projects/<project_id>")
def get_project(project_id: str):
    try:
        return jsonify({"project": read_project(project_id)})
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404


@app.post("/api/transcribe")
def transcribe_voiceover():
    audio = request.files.get("audio")
    if not audio or not audio.filename:
        return jsonify({"error": "Upload a voiceover audio file first."}), 400
    if not is_allowed(audio.filename, ALLOWED_AUDIO_EXTENSIONS):
        return jsonify({"error": f"Unsupported audio file type: {secure_filename(audio.filename)}"}), 400

    try:
        duration_seconds = float(request.form.get("durationSeconds", "30") or 30)
    except ValueError:
        duration_seconds = 30
    duration_seconds = max(5, min(duration_seconds, 120))

    temp_dir = PROJECTS_DIR / "_transcription_uploads"
    temp_dir.mkdir(parents=True, exist_ok=True)
    suffix = file_ext(audio.filename)
    temp_path = temp_dir / f"{now_id()}_{secure_filename(audio.filename) or 'voiceover'}.{suffix}"
    audio.save(temp_path)

    try:
        scenes = transcribe_audio_to_scenes(temp_path, duration_seconds)
        return jsonify({"scenes": scenes})
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 501
    except Exception as exc:
        return jsonify({"error": f"Could not transcribe audio: {exc}"}), 500
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass


@app.delete("/api/projects/<project_id>")
def delete_project(project_id: str):
    try:
        project_dir = child_path(PROJECTS_DIR, project_id)
        public_dir = child_path(REMOTION_PUBLIC_PROJECTS, project_id)
        output_file = child_path(OUTPUTS_DIR, f"{project_id}.mp4")
    except ValueError:
        return jsonify({"error": "Invalid project id."}), 400

    if not project_dir.exists():
        return jsonify({"error": "Project not found."}), 404

    shutil.rmtree(project_dir)
    if public_dir.exists():
        shutil.rmtree(public_dir)
    if output_file.exists():
        output_file.unlink()

    return jsonify({"deleted": True, "id": project_id})


@app.get("/preview-assets/<path:filename>")
def preview_asset(filename: str):
    return send_from_directory(REMOTION_PUBLIC_DIR, filename, as_attachment=False)


@app.post("/api/projects/<project_id>/render")
def render_project(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404

    if not (REMOTION_DIR / "node_modules").exists():
        return jsonify({
            "error": "Remotion dependencies are not installed yet. Run: cd remotion && npm install"
        }), 400

    output_path = OUTPUTS_DIR / f"{project_id}.mp4"
    props_path = PROJECTS_DIR / project_id / "remotion-props.json"
    log_path = PROJECTS_DIR / project_id / "render.log"

    props = {
        "title": project.get("title"),
        "productName": project.get("productName"),
        "targetUrl": project.get("targetUrl"),
        "cta": project.get("cta"),
        "format": project.get("format"),
        "template": project.get("template"),
        "durationSeconds": project.get("durationSeconds", 30),
        "fps": project.get("fps", 30),
        "screenAsset": project.get("assets", {}).get("screen"),
        "screenDurationSeconds": project.get("assets", {}).get("screenDurationSeconds") or probe_media_duration(REMOTION_PUBLIC_DIR / str(project.get("assets", {}).get("screen", ""))),
        "voiceoverAsset": project.get("assets", {}).get("voiceover"),
        "backgroundMusicAsset": project.get("assets", {}).get("backgroundMusic"),
        "logoAsset": project.get("assets", {}).get("logo"),
        "scenes": project.get("scenes", []),
        "clips": project.get("clips", []),
    }
    props_path.write_text(json.dumps(props, indent=2), encoding="utf-8")

    project["status"] = "rendering"
    project["render"]["lastStartedAt"] = datetime.now().isoformat(timespec="seconds")
    project["render"]["lastError"] = None
    write_project(project_id, project)

    npx = "npx.cmd" if os.name == "nt" else "npx"
    composition_id = "PromoVertical"
    if project.get("format") == "landscape":
        composition_id = "PromoLandscape"
    elif project.get("format") == "square":
        composition_id = "PromoSquare"

    cmd = [
        npx,
        "remotion",
        "render",
        "src/index.ts",
        composition_id,
        str(output_path),
        f"--props={props_path}",
        "--overwrite",
    ]

    started = time.time()
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(REMOTION_DIR),
            capture_output=True,
            text=True,
            timeout=60 * 20,
        )
        log_path.write_text(
            "COMMAND:\n" + " ".join(cmd) + "\n\nSTDOUT:\n" + proc.stdout + "\n\nSTDERR:\n" + proc.stderr,
            encoding="utf-8",
        )
        if proc.returncode != 0:
            project["status"] = "failed"
            project["render"]["lastError"] = proc.stderr[-4000:] or proc.stdout[-4000:]
            project["render"]["lastFinishedAt"] = datetime.now().isoformat(timespec="seconds")
            project["render"]["logFile"] = str(log_path.relative_to(BASE_DIR))
            write_project(project_id, project)
            return jsonify({"error": "Render failed.", "details": project["render"]["lastError"]}), 500

        project["status"] = "rendered"
        project["outputUrl"] = f"/outputs/{project_id}.mp4"
        project["render"]["lastFinishedAt"] = datetime.now().isoformat(timespec="seconds")
        project["render"]["logFile"] = str(log_path.relative_to(BASE_DIR))
        project["render"]["secondsElapsed"] = round(time.time() - started, 1)
        write_project(project_id, project)
        return jsonify({"project": project, "outputUrl": project["outputUrl"]})
    except subprocess.TimeoutExpired:
        project["status"] = "failed"
        project["render"]["lastError"] = "Render timed out after 20 minutes."
        project["render"]["lastFinishedAt"] = datetime.now().isoformat(timespec="seconds")
        write_project(project_id, project)
        return jsonify({"error": project["render"]["lastError"]}), 500
    except FileNotFoundError:
        project["status"] = "failed"
        project["render"]["lastError"] = "npx was not found. Install Node.js, then run npm install in the remotion folder."
        project["render"]["lastFinishedAt"] = datetime.now().isoformat(timespec="seconds")
        write_project(project_id, project)
        return jsonify({"error": project["render"]["lastError"]}), 500


@app.get("/outputs/<path:filename>")
def download_output(filename: str):
    return send_from_directory(OUTPUTS_DIR, filename, as_attachment=False)


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5055)
