const sceneTableBody = document.querySelector('#sceneTable tbody');
const clipTableBody = document.querySelector('#clipTable tbody');
const projectForm = document.querySelector('#projectForm');
const message = document.querySelector('#message');
const projectsList = document.querySelector('#projectsList');

const BACKGROUND_PRESETS = [
  { id: 'reading-room', label: 'Reading room', thumb: '/preview-assets/assets/lifestyle-reading-room.png' },
  { id: 'office-desk', label: 'Office desk', thumb: '/preview-assets/assets/background-office-desk.png' },
  { id: 'cafe-table', label: 'Cafe table', thumb: '/preview-assets/assets/background-cafe-table.png' },
  { id: 'dark-studio', label: 'Dark studio', thumb: '/preview-assets/assets/background-dark-studio.png' },
  { id: 'home-office', label: 'Home office', thumb: '/preview-assets/assets/background-home-office.png' },
  { id: 'classroom', label: 'Classroom', thumb: '/preview-assets/assets/background-classroom.png' },
  { id: 'meeting-room', label: 'Meeting room', thumb: '/preview-assets/assets/background-meeting-room.png' },
  { id: 'evening-desk', label: 'Evening desk', thumb: '/preview-assets/assets/background-evening-desk.png' },
  { id: 'kitchen-counter', label: 'Kitchen counter', thumb: '/preview-assets/assets/background-kitchen-counter.png' },
  { id: 'creator-studio', label: 'Creator studio', thumb: '/preview-assets/assets/background-creator-studio.png' },
];

const DEVICE_PRESETS = [
  { id: 'tablet-pro', label: 'Tablet Pro' },
  { id: 'phone-modern', label: 'Phone' },
  { id: 'laptop-silver', label: 'Laptop' },
  { id: 'browser-window', label: 'Browser' },
];

const ANGLE_PRESETS = [
  { id: 'low-desk-left', label: 'Low desk left' },
  { id: 'low-desk-right', label: 'Low desk right' },
  { id: 'front-center', label: 'Front center' },
  { id: 'floating-hero', label: 'Floating hero' },
];

const MOTION_PRESETS = [
  { id: 'slow-push-in', label: 'Slow push in' },
  { id: 'screen-focus', label: 'Screen focus' },
  { id: 'pan-left', label: 'Pan left' },
  { id: 'pan-right', label: 'Pan right' },
  { id: 'device-tilt', label: 'Handheld camera' },
  { id: 'cta-push', label: 'CTA push' },
];

const TRANSITION_PRESETS = [
  { id: 'soft-fade', label: 'Soft fade' },
  { id: 'clean-cut', label: 'Clean cut' },
  { id: 'slide-up', label: 'Slide up' },
];

const CAPTION_STYLE_PRESETS = [
  { id: 'white-chip', label: 'White chip', sample: 'Clean' },
  { id: 'glass-card', label: 'Glass card', sample: 'Glass' },
  { id: 'bold-bottom', label: 'Bold bottom', sample: 'Bold' },
  { id: 'editorial-card', label: 'Editorial card', sample: 'Editorial' },
  { id: 'neon-ribbon', label: 'Neon ribbon', sample: 'Accent' },
  { id: 'kinetic-stack', label: 'Kinetic stack', sample: 'Stack' },
  { id: 'minimal-subtitle', label: 'Minimal subtitle', sample: 'Subtitle' },
  { id: 'device-callout', label: 'Device callout', sample: 'Callout' },
];

const CAPTION_POSITION_PRESETS = [
  { id: 'auto', label: 'Auto' },
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'device', label: 'Near device' },
];

const CAPTION_ANIMATION_PRESETS = [
  { id: 'rise', label: 'Fade rise' },
  { id: 'pop', label: 'Pop' },
  { id: 'slide-mask', label: 'Slide mask' },
  { id: 'type-on', label: 'Type on' },
  { id: 'none', label: 'None' },
];

const CAPTION_SIZE_PRESETS = [
  { id: 'compact', label: 'Compact' },
  { id: 'standard', label: 'Standard' },
  { id: 'large', label: 'Large' },
  { id: 'hero', label: 'Hero' },
];

const CAPTION_ACCENT_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'first-word', label: 'First word' },
  { id: 'last-word', label: 'Last word' },
];

const CLIP_MODE_PRESETS = [
  { id: 'device-screen', label: 'Device screen' },
  { id: 'full-screen', label: 'Full screen' },
  { id: 'background', label: 'Background' },
  { id: 'overlay', label: 'Overlay' },
];

const DEFAULT_DESIGN = {
  background: 'reading-room',
  device: 'tablet-pro',
  angle: 'low-desk-left',
  motion: 'slow-push-in',
  motionAmount: 2.2,
  screenZoom: 1,
  transition: 'soft-fade',
  captionStyle: 'white-chip',
  captionPosition: 'auto',
  captionAnimation: 'rise',
  captionSize: 'standard',
  captionAccent: 'none',
  captionAnimationAmount: 1.4,
};

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.className = 'message hidden';
  message.textContent = '';
}

function addScene(scene = {}) {
  const rowId = `scene-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const design = { ...DEFAULT_DESIGN, ...scene };
  const tr = document.createElement('tr');
  tr.className = 'scene-main';
  tr.dataset.designRow = rowId;
  tr.dataset.words = JSON.stringify(Array.isArray(scene.words) ? scene.words : []);
  tr.innerHTML = `
    <td><input type="number" step="0.01" min="0" class="scene-start" value="${scene.start ?? ''}" /></td>
    <td><input type="number" step="0.01" min="0" class="scene-end" value="${scene.end ?? ''}" /></td>
    <td><textarea rows="2" class="scene-caption">${escapeHtml(scene.caption ?? '')}</textarea></td>
    <td><textarea rows="2" class="scene-narration">${escapeHtml(scene.narration ?? '')}</textarea></td>
    <td><button type="button" class="delete">×</button></td>
  `;
  const designRow = document.createElement('tr');
  designRow.className = 'scene-design-row';
  designRow.dataset.rowId = rowId;
  designRow.innerHTML = `
    <td colspan="5">
      <div class="scene-design-grid">
        <div class="design-field wide">
          <span>Background</span>
          <div class="thumb-options">${renderThumbOptions(BACKGROUND_PRESETS, design.background, `${rowId}-bg`, 'scene-background')}</div>
        </div>
        <div class="design-field wide">
          <span>Device</span>
          <div class="device-options">${renderDeviceOptions(DEVICE_PRESETS, design.device, `${rowId}-device`)}</div>
        </div>
        <label class="design-field">
          Angle
          <select class="scene-angle">${renderOptions(ANGLE_PRESETS, design.angle)}</select>
        </label>
        <label class="design-field">
          Animation
          <select class="scene-motion">${renderOptions(MOTION_PRESETS, design.motion)}</select>
        </label>
        <label class="design-field zoom-field">
          Animation amount <strong>${Number(design.motionAmount || DEFAULT_DESIGN.motionAmount).toFixed(2)}×</strong>
          <input type="range" min="0.5" max="2.2" step="0.05" class="scene-motion-amount" value="${Number(design.motionAmount || DEFAULT_DESIGN.motionAmount)}" />
        </label>
        <label class="design-field">
          Transition
          <select class="scene-transition">${renderOptions(TRANSITION_PRESETS, design.transition)}</select>
        </label>
        <label class="design-field zoom-field">
          Screen zoom <strong>${Number(design.screenZoom || DEFAULT_DESIGN.screenZoom).toFixed(2)}×</strong>
          <input type="range" min="1" max="1.6" step="0.01" class="scene-screen-zoom" value="${Number(design.screenZoom || DEFAULT_DESIGN.screenZoom)}" />
        </label>
        <div class="design-field caption-style-field wide">
          <span>Caption style</span>
          <div class="caption-style-options">${renderCaptionStyleOptions(CAPTION_STYLE_PRESETS, design.captionStyle, `${rowId}-caption`)}</div>
        </div>
        <label class="design-field">
          Caption position
          <select class="scene-caption-position">${renderOptions(CAPTION_POSITION_PRESETS, design.captionPosition)}</select>
        </label>
        <label class="design-field">
          Caption animation
          <select class="scene-caption-animation">${renderOptions(CAPTION_ANIMATION_PRESETS, design.captionAnimation)}</select>
        </label>
        <label class="design-field">
          Caption size
          <select class="scene-caption-size">${renderOptions(CAPTION_SIZE_PRESETS, design.captionSize)}</select>
        </label>
        <label class="design-field">
          Caption accent
          <select class="scene-caption-accent">${renderOptions(CAPTION_ACCENT_PRESETS, design.captionAccent)}</select>
        </label>
        <label class="design-field zoom-field">
          Caption motion <strong>${Number(design.captionAnimationAmount || DEFAULT_DESIGN.captionAnimationAmount).toFixed(2)}×</strong>
          <input type="range" min="0.5" max="2.2" step="0.05" class="scene-caption-animation-amount" value="${Number(design.captionAnimationAmount || DEFAULT_DESIGN.captionAnimationAmount)}" />
        </label>
      </div>
    </td>
  `;
  tr.querySelector('.delete').addEventListener('click', () => {
    designRow.remove();
    tr.remove();
  });
  designRow.querySelector('.scene-motion-amount').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  designRow.querySelector('.scene-screen-zoom').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  designRow.querySelector('.scene-caption-animation-amount').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  sceneTableBody.appendChild(tr);
  sceneTableBody.appendChild(designRow);
}

function renderOptions(presets, selected) {
  return presets.map((preset) => `<option value="${preset.id}" ${preset.id === selected ? 'selected' : ''}>${preset.label}</option>`).join('');
}

function renderThumbOptions(presets, selected, name, className) {
  return presets.map((preset) => `
    <label class="thumb-option">
      <input type="radio" class="${className}" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <img src="${preset.thumb}" alt="" />
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function renderDeviceOptions(presets, selected, name) {
  return presets.map((preset) => `
    <label class="device-option ${preset.id}">
      <input type="radio" class="scene-device" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <span class="device-icon"></span>
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function renderCaptionStyleOptions(presets, selected, name) {
  return presets.map((preset) => `
    <label class="caption-style-option ${preset.id}">
      <input type="radio" class="scene-caption-style" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <span class="caption-style-preview"><b>${preset.sample}</b><em>Product</em></span>
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function addClip(clip = {}) {
  const rowId = `clip_${Date.now()}_${Math.round(Math.random() * 100000)}`;
  const tr = document.createElement('tr');
  tr.className = 'clip-row';
  tr.innerHTML = `
    <td><input type="number" step="0.01" min="0" class="clip-start" value="${clip.start ?? ''}" /></td>
    <td><input type="number" step="0.01" min="0" class="clip-end" value="${clip.end ?? ''}" /></td>
    <td><select class="clip-mode">${renderOptions(CLIP_MODE_PRESETS, clip.mode || 'device-screen')}</select></td>
    <td><input name="${rowId}" type="file" class="clip-file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" /></td>
    <td><input class="clip-label" value="${escapeHtml(clip.label || '')}" placeholder="Optional" /></td>
    <td><button type="button" class="delete">×</button></td>
  `;
  tr.querySelector('.delete').addEventListener('click', () => tr.remove());
  clipTableBody.appendChild(tr);
}

function loadSampleScenes() {
  sceneTableBody.innerHTML = '';
  [
    { start: 0, end: 4, caption: 'Story time,\njust got smarter', narration: 'Story time just got smarter.', background: 'reading-room', device: 'tablet-pro', angle: 'low-desk-left', motion: 'slow-push-in', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'editorial-card', captionPosition: 'top', captionAnimation: 'pop', captionSize: 'large', captionAccent: 'last-word', captionAnimationAmount: 1.65 },
    { start: 4, end: 9, caption: 'the interactive story companion', narration: 'Meet the interactive story companion for young readers.', background: 'office-desk', device: 'laptop-silver', angle: 'front-center', motion: 'screen-focus', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'glass-card', captionPosition: 'top', captionAnimation: 'rise', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.4 },
    { start: 9, end: 15, caption: 'listen', narration: 'Listen to every line with clear narration.', background: 'cafe-table', device: 'phone-modern', angle: 'floating-hero', motion: 'device-tilt', motionAmount: 2.2, screenZoom: 1, transition: 'slide-up', captionStyle: 'neon-ribbon', captionPosition: 'top', captionAnimation: 'slide-mask', captionSize: 'compact', captionAccent: 'first-word', captionAnimationAmount: 1.7 },
    { start: 15, end: 22, caption: 'and tap any word to\nhear it out', narration: 'Tap any word to hear it out and build confidence.', background: 'home-office', device: 'tablet-pro', angle: 'low-desk-right', motion: 'pan-left', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'bold-bottom', captionPosition: 'bottom', captionAnimation: 'rise', captionSize: 'hero', captionAccent: 'last-word', captionAnimationAmount: 1.55 },
    { start: 22, end: 26, caption: 'built from your real product', narration: 'Built from your real website or software recording.', background: 'meeting-room', device: 'browser-window', angle: 'front-center', motion: 'pan-right', motionAmount: 2.2, screenZoom: 1, transition: 'clean-cut', captionStyle: 'minimal-subtitle', captionPosition: 'bottom', captionAnimation: 'type-on', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.2 },
    { start: 26, end: 30, caption: 'Try it free today', narration: 'Try it free today.', background: 'creator-studio', device: 'tablet-pro', angle: 'floating-hero', motion: 'cta-push', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'device-callout', captionPosition: 'device', captionAnimation: 'pop', captionSize: 'large', captionAccent: 'first-word', captionAnimationAmount: 1.8 },
  ].forEach(addScene);
}

function collectScenes() {
  return [...sceneTableBody.querySelectorAll('tr.scene-main')].map(row => {
    const designRow = row.nextElementSibling;
    const words = parseWords(row.dataset.words);
    return {
      start: Number(row.querySelector('.scene-start').value || 0),
      end: Number(row.querySelector('.scene-end').value || 0),
      caption: row.querySelector('.scene-caption').value.trim(),
      narration: row.querySelector('.scene-narration').value.trim(),
      background: checkedValue(designRow, '.scene-background', DEFAULT_DESIGN.background),
      device: checkedValue(designRow, '.scene-device', DEFAULT_DESIGN.device),
      angle: designRow.querySelector('.scene-angle').value,
      motion: designRow.querySelector('.scene-motion').value,
      motionAmount: Number(designRow.querySelector('.scene-motion-amount').value || DEFAULT_DESIGN.motionAmount),
      screenZoom: Number(designRow.querySelector('.scene-screen-zoom').value || DEFAULT_DESIGN.screenZoom),
      transition: designRow.querySelector('.scene-transition').value,
      captionStyle: checkedValue(designRow, '.scene-caption-style', DEFAULT_DESIGN.captionStyle),
      captionPosition: designRow.querySelector('.scene-caption-position').value,
      captionAnimation: designRow.querySelector('.scene-caption-animation').value,
      captionSize: designRow.querySelector('.scene-caption-size').value,
      captionAccent: designRow.querySelector('.scene-caption-accent').value,
      captionAnimationAmount: Number(designRow.querySelector('.scene-caption-animation-amount').value || DEFAULT_DESIGN.captionAnimationAmount),
      words,
      wordTimingSource: hasVoiceoverWordTiming(words) ? 'voiceover' : 'estimated',
    };
  }).filter(s => s.end > s.start && (s.caption || s.narration));
}

function parseWords(value) {
  try {
    const words = JSON.parse(value || '[]');
    return Array.isArray(words) ? words : [];
  } catch {
    return [];
  }
}

function hasVoiceoverWordTiming(words) {
  return words.some((word) => word.source === 'voiceover' || (word.source !== 'estimated' && Number.isFinite(Number(word.start)) && Number.isFinite(Number(word.end))));
}

function collectClips() {
  return [...clipTableBody.querySelectorAll('tr.clip-row')].map(row => {
    const fileInput = row.querySelector('.clip-file');
    return {
      start: Number(row.querySelector('.clip-start').value || 0),
      end: Number(row.querySelector('.clip-end').value || 0),
      mode: row.querySelector('.clip-mode').value,
      label: row.querySelector('.clip-label').value.trim() || fileInput.files[0]?.name || 'Clip',
      fileField: fileInput.name,
    };
  }).filter((clip, index) => {
    const row = clipTableBody.querySelectorAll('tr.clip-row')[index];
    return clip.end > clip.start && row.querySelector('.clip-file').files.length > 0;
  });
}

async function generateScenesFromVoiceover(button) {
  const audio = document.querySelector('#voiceoverInput').files[0];
  if (!audio) {
    showMessage('Choose a voiceover file first, then generate captions from it.', 'error');
    return;
  }

  button.disabled = true;
  button.textContent = 'Transcribing...';
  showMessage('Transcribing voiceover. The first run can take a while if the local model needs to load.', '');
  try {
    const formData = new FormData();
    formData.set('audio', audio);
    formData.set('durationSeconds', projectForm.elements.durationSeconds.value || '30');
    formData.set('productName', projectForm.elements.productName.value || '');
    formData.set('cta', projectForm.elements.cta.value || '');

    const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not transcribe voiceover');

    sceneTableBody.innerHTML = '';
    data.scenes.forEach(addScene);
    showMessage(`Generated ${data.scenes.length} caption scenes from voiceover.`, 'success');
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Generate from voiceover';
  }
}

function checkedValue(root, selector, fallback) {
  return root.querySelector(`${selector}:checked`)?.value || fallback;
}

async function loadProjects() {
  projectsList.innerHTML = '<p>Loading projects...</p>';
  const res = await fetch('/api/projects');
  const data = await res.json();
  if (!data.projects?.length) {
    projectsList.innerHTML = '<p>No projects yet. Create your first promo video project.</p>';
    return;
  }
  projectsList.innerHTML = '';
  data.projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    const output = project.outputUrl
      ? `<a class="button-link secondary" href="${project.outputUrl}" target="_blank">Open MP4</a>`
      : '';
    const preview = project.id
      ? `<a class="button-link secondary" href="/preview/${encodeURIComponent(project.id)}" target="_blank">Preview</a>`
      : '';
    card.innerHTML = `
      <h3>${escapeHtml(project.title || project.id)}</h3>
      <p>${escapeHtml(project.productName || '')}</p>
      <span class="badge">${escapeHtml(project.status || 'draft')} · ${escapeHtml(project.format || '')}</span>
      <p>${escapeHtml(project.createdAt || '')}</p>
      <div class="card-actions">
        ${preview}
        <button class="secondary render-btn" data-id="${project.id}">Render MP4</button>
        <button class="danger-btn delete-project-btn" data-id="${project.id}">Delete</button>
        ${output}
      </div>
    `;
    projectsList.appendChild(card);
  });

  projectsList.querySelectorAll('.render-btn').forEach(btn => {
    btn.addEventListener('click', async () => renderProject(btn.dataset.id, btn));
  });
  projectsList.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', async () => deleteProject(btn.dataset.id, btn));
  });
}

async function renderProject(projectId, button) {
  button.disabled = true;
  button.textContent = 'Rendering...';
  showMessage('Rendering started. For MVP this runs synchronously, so keep this page open.', '');
  try {
    const res = await fetch(`/api/projects/${projectId}/render`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Render failed');
    showMessage(`Rendered successfully: ${data.outputUrl}`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Render MP4';
  }
}

async function deleteProject(projectId, button) {
  const ok = window.confirm('Delete this project, uploaded assets, and rendered MP4?');
  if (!ok) return;
  button.disabled = true;
  button.textContent = 'Deleting...';
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not delete project');
    showMessage(`Deleted project: ${projectId}`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
    button.disabled = false;
    button.textContent = 'Delete';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();
  const scenes = collectScenes();
  if (!scenes.length) {
    showMessage('Please add at least one scene with valid start/end times.', 'error');
    return;
  }
  const clips = collectClips();
  const formData = new FormData(projectForm);
  formData.set('scenes', JSON.stringify(scenes));
  formData.set('clips', JSON.stringify(clips));
  const submitBtn = projectForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  try {
    const res = await fetch('/api/projects', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save project');
    showMessage(`Project saved: ${data.project.id}\nNext: open Preview or click Render MP4 in the Projects panel.`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Project';
  }
});

document.querySelector('#addSceneBtn').addEventListener('click', () => addScene());
document.querySelector('#addClipBtn').addEventListener('click', () => addClip());
document.querySelector('#loadSampleBtn').addEventListener('click', loadSampleScenes);
document.querySelector('#transcribeVoiceoverBtn').addEventListener('click', event => generateScenesFromVoiceover(event.target));
document.querySelector('#refreshProjectsBtn').addEventListener('click', loadProjects);

loadSampleScenes();
loadProjects();
