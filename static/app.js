const sceneTableBody = document.querySelector('#sceneTable tbody');
const projectForm = document.querySelector('#projectForm');
const message = document.querySelector('#message');
const projectsList = document.querySelector('#projectsList');

const BACKGROUND_PRESETS = [
  { id: 'reading-room', label: 'Reading room', thumb: '/preview-assets/assets/lifestyle-reading-room.png' },
  { id: 'office-desk', label: 'Office desk', thumb: '/preview-assets/assets/background-office-desk.png' },
  { id: 'cafe-table', label: 'Cafe table', thumb: '/preview-assets/assets/background-cafe-table.png' },
  { id: 'dark-studio', label: 'Dark studio', thumb: '/preview-assets/assets/background-dark-studio.png' },
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
  { id: 'device-tilt', label: 'Device tilt' },
  { id: 'cta-push', label: 'CTA push' },
];

const TRANSITION_PRESETS = [
  { id: 'soft-fade', label: 'Soft fade' },
  { id: 'clean-cut', label: 'Clean cut' },
  { id: 'slide-up', label: 'Slide up' },
];

const CAPTION_STYLE_PRESETS = [
  { id: 'white-chip', label: 'White chip' },
  { id: 'glass-card', label: 'Glass card' },
  { id: 'bold-bottom', label: 'Bold bottom' },
];

const DEFAULT_DESIGN = {
  background: 'reading-room',
  device: 'tablet-pro',
  angle: 'low-desk-left',
  motion: 'slow-push-in',
  screenZoom: 1.06,
  transition: 'soft-fade',
  captionStyle: 'white-chip',
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
  tr.innerHTML = `
    <td><input type="number" step="0.1" min="0" class="scene-start" value="${scene.start ?? ''}" /></td>
    <td><input type="number" step="0.1" min="0" class="scene-end" value="${scene.end ?? ''}" /></td>
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
        <label class="design-field">
          Transition
          <select class="scene-transition">${renderOptions(TRANSITION_PRESETS, design.transition)}</select>
        </label>
        <label class="design-field">
          Caption
          <select class="scene-caption-style">${renderOptions(CAPTION_STYLE_PRESETS, design.captionStyle)}</select>
        </label>
        <label class="design-field zoom-field">
          Screen zoom <strong>${Number(design.screenZoom || 1.06).toFixed(2)}×</strong>
          <input type="range" min="1" max="1.6" step="0.01" class="scene-screen-zoom" value="${Number(design.screenZoom || 1.06)}" />
        </label>
      </div>
    </td>
  `;
  tr.querySelector('.delete').addEventListener('click', () => {
    designRow.remove();
    tr.remove();
  });
  designRow.querySelector('.scene-screen-zoom').addEventListener('input', (event) => {
    designRow.querySelector('.zoom-field strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
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

function loadSampleScenes() {
  sceneTableBody.innerHTML = '';
  [
    { start: 0, end: 4, caption: 'Story time,\njust got smarter', narration: 'Story time just got smarter.', background: 'reading-room', device: 'tablet-pro', angle: 'low-desk-left', motion: 'slow-push-in', screenZoom: 1.06, transition: 'soft-fade', captionStyle: 'white-chip' },
    { start: 4, end: 9, caption: 'the interactive story companion', narration: 'Meet the interactive story companion for young readers.', background: 'office-desk', device: 'laptop-silver', angle: 'front-center', motion: 'screen-focus', screenZoom: 1.14, transition: 'soft-fade', captionStyle: 'glass-card' },
    { start: 9, end: 15, caption: 'listen', narration: 'Listen to every line with clear narration.', background: 'cafe-table', device: 'phone-modern', angle: 'floating-hero', motion: 'device-tilt', screenZoom: 1.18, transition: 'slide-up', captionStyle: 'white-chip' },
    { start: 15, end: 22, caption: 'and tap any word to\nhear it out', narration: 'Tap any word to hear it out and build confidence.', background: 'reading-room', device: 'tablet-pro', angle: 'low-desk-right', motion: 'pan-left', screenZoom: 1.22, transition: 'soft-fade', captionStyle: 'bold-bottom' },
    { start: 22, end: 26, caption: 'built from your real product', narration: 'Built from your real website or software recording.', background: 'dark-studio', device: 'browser-window', angle: 'front-center', motion: 'pan-right', screenZoom: 1.1, transition: 'clean-cut', captionStyle: 'glass-card' },
    { start: 26, end: 30, caption: 'Try it free today', narration: 'Try it free today.', background: 'dark-studio', device: 'tablet-pro', angle: 'floating-hero', motion: 'cta-push', screenZoom: 1.08, transition: 'soft-fade', captionStyle: 'white-chip' },
  ].forEach(addScene);
}

function collectScenes() {
  return [...sceneTableBody.querySelectorAll('tr.scene-main')].map(row => {
    const designRow = row.nextElementSibling;
    return {
      start: Number(row.querySelector('.scene-start').value || 0),
      end: Number(row.querySelector('.scene-end').value || 0),
      caption: row.querySelector('.scene-caption').value.trim(),
      narration: row.querySelector('.scene-narration').value.trim(),
      background: checkedValue(designRow, '.scene-background', DEFAULT_DESIGN.background),
      device: checkedValue(designRow, '.scene-device', DEFAULT_DESIGN.device),
      angle: designRow.querySelector('.scene-angle').value,
      motion: designRow.querySelector('.scene-motion').value,
      screenZoom: Number(designRow.querySelector('.scene-screen-zoom').value || DEFAULT_DESIGN.screenZoom),
      transition: designRow.querySelector('.scene-transition').value,
      captionStyle: designRow.querySelector('.scene-caption-style').value,
    };
  }).filter(s => s.end > s.start && (s.caption || s.narration));
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
        ${output}
      </div>
    `;
    projectsList.appendChild(card);
  });

  projectsList.querySelectorAll('.render-btn').forEach(btn => {
    btn.addEventListener('click', async () => renderProject(btn.dataset.id, btn));
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
  const formData = new FormData(projectForm);
  formData.set('scenes', JSON.stringify(scenes));
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
document.querySelector('#loadSampleBtn').addEventListener('click', loadSampleScenes);
document.querySelector('#refreshProjectsBtn').addEventListener('click', loadProjects);

loadSampleScenes();
loadProjects();
