const sceneTableBody = document.querySelector('#sceneTable tbody');
const clipTableBody = document.querySelector('#clipTable tbody');
const projectForm = document.querySelector('#projectForm');
const message = document.querySelector('#message');
const projectsList = document.querySelector('#projectsList');
const globalCaptionStyles = document.querySelector('#globalCaptionStyles');
const globalCaptionPosition = document.querySelector('#globalCaptionPosition');
const globalCaptionSize = document.querySelector('#globalCaptionSize');
const globalCaptionAccent = document.querySelector('#globalCaptionAccent');

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
  { id: 'none', label: 'None' },
  { id: 'rise', label: 'Fade rise' },
  { id: 'pop', label: 'Pop' },
  { id: 'slide-mask', label: 'Slide mask' },
  { id: 'type-on', label: 'Type on' },
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
  captionAnimation: 'none',
  captionSize: 'standard',
  captionAccent: 'none',
  captionAnimationAmount: 1.4,
};
const DEFAULT_CLIP_DURATION = 4;
let selectedSceneId = '';
let dragSceneId = '';
let dragClipId = '';

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.className = 'message hidden';
  message.textContent = '';
}

function globalCaptionDesign() {
  return {
    captionStyle: checkedValue(document, '.global-caption-style', DEFAULT_DESIGN.captionStyle),
    captionPosition: globalCaptionPosition?.value || DEFAULT_DESIGN.captionPosition,
    captionAnimation: 'none',
    captionSize: globalCaptionSize?.value || DEFAULT_DESIGN.captionSize,
    captionAccent: globalCaptionAccent?.value || DEFAULT_DESIGN.captionAccent,
    captionAnimationAmount: DEFAULT_DESIGN.captionAnimationAmount,
  };
}

function initGlobalCaptionControls() {
  if (globalCaptionStyles) {
    globalCaptionStyles.innerHTML = renderCaptionStyleOptions(CAPTION_STYLE_PRESETS, DEFAULT_DESIGN.captionStyle, 'global-caption-style', 'global-caption-style');
  }
  if (globalCaptionPosition) globalCaptionPosition.innerHTML = renderOptions(CAPTION_POSITION_PRESETS, DEFAULT_DESIGN.captionPosition);
  if (globalCaptionSize) globalCaptionSize.innerHTML = renderOptions(CAPTION_SIZE_PRESETS, DEFAULT_DESIGN.captionSize);
  if (globalCaptionAccent) globalCaptionAccent.innerHTML = renderOptions(CAPTION_ACCENT_PRESETS, DEFAULT_DESIGN.captionAccent);
}

function addScene(scene = {}, options = {}) {
  const rowId = `scene-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const design = { ...DEFAULT_DESIGN, ...scene };
  const tr = document.createElement('tr');
  tr.className = 'scene-main';
  tr.dataset.designRow = rowId;
  tr.dataset.sceneId = rowId;
  tr.dataset.words = JSON.stringify(Array.isArray(scene.words) ? scene.words : []);
  tr.draggable = true;
  tr.innerHTML = `
    <td class="drag-cell"><button type="button" class="drag-handle" title="Drag scene">☰</button></td>
    <td><input type="number" step="0.01" min="0" class="scene-start" value="${scene.start ?? ''}" /></td>
    <td><input type="number" step="0.01" min="0" class="scene-end" value="${scene.end ?? ''}" /></td>
    <td><textarea rows="2" class="scene-caption">${escapeHtml(scene.caption ?? '')}</textarea></td>
    <td><textarea rows="2" class="scene-narration">${escapeHtml(scene.narration ?? '')}</textarea></td>
    <td class="row-actions">
      <button type="button" class="insert-after small-icon-btn" title="Insert scene after this">+</button>
      <button type="button" class="delete">×</button>
    </td>
  `;
  const designRow = document.createElement('tr');
  designRow.className = 'scene-design-row';
  designRow.dataset.rowId = rowId;
  designRow.innerHTML = `
    <td colspan="6">
      <details class="scene-advanced">
        <summary>Scene visual overrides</summary>
        <label class="override-toggle">
          <input type="checkbox" class="scene-caption-override" ${scene.captionOverride ? 'checked' : ''} />
          Override global caption style for this scene
        </label>
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
      </details>
    </td>
  `;
  tr.addEventListener('click', () => selectScene(rowId));
  tr.addEventListener('dragstart', (event) => {
    dragSceneId = rowId;
    tr.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });
  tr.addEventListener('dragend', () => {
    dragSceneId = '';
    tr.classList.remove('dragging');
    [...sceneTableBody.querySelectorAll('.drag-over')].forEach(row => row.classList.remove('drag-over'));
    refreshClipPlacementOptions();
  });
  tr.addEventListener('dragover', (event) => {
    if (!dragSceneId || dragSceneId === rowId) return;
    event.preventDefault();
    tr.classList.add('drag-over');
  });
  tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
  tr.addEventListener('drop', (event) => {
    event.preventDefault();
    moveScenePair(dragSceneId, rowId);
  });
  tr.querySelector('.insert-after').addEventListener('click', (event) => {
    event.stopPropagation();
    addScene(afterSceneDefaults(rowId), { afterSceneId: rowId });
  });
  tr.querySelector('.delete').addEventListener('click', (event) => {
    event.stopPropagation();
    designRow.remove();
    tr.remove();
    if (selectedSceneId === rowId) {
      selectedSceneId = sceneRows().at(-1)?.dataset.sceneId || '';
      if (selectedSceneId) selectScene(selectedSceneId);
    }
    refreshClipPlacementOptions();
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
  insertScenePair(tr, designRow, options.afterSceneId);
  selectScene(rowId);
  refreshClipPlacementOptions();
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

function renderCaptionStyleOptions(presets, selected, name, className = 'scene-caption-style') {
  return presets.map((preset) => `
    <label class="caption-style-option ${preset.id}">
      <input type="radio" class="${className}" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <span class="caption-style-preview"><b>${preset.sample}</b><em>Product</em></span>
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function insertScenePair(tr, designRow, afterSceneId = '') {
  if (afterSceneId) {
    const anchor = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${afterSceneId}"]`);
    const anchorDesign = anchor?.nextElementSibling;
    if (anchorDesign) {
      anchorDesign.after(tr, designRow);
      return;
    }
  }
  sceneTableBody.appendChild(tr);
  sceneTableBody.appendChild(designRow);
}

function moveScenePair(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const source = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${sourceId}"]`);
  const target = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${targetId}"]`);
  if (!source || !target) return;
  const sourceDesign = source.nextElementSibling;
  const targetDesign = target.nextElementSibling;
  const beforeTarget = source.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING;
  if (beforeTarget) {
    targetDesign.after(source, sourceDesign);
  } else {
    target.before(source, sourceDesign);
  }
  selectScene(sourceId);
  refreshClipPlacementOptions();
}

function selectScene(rowId) {
  selectedSceneId = rowId;
  sceneTableBody.querySelectorAll('tr.scene-main').forEach(row => row.classList.toggle('selected-row', row.dataset.sceneId === rowId));
}

function sceneRows() {
  return [...sceneTableBody.querySelectorAll('tr.scene-main')];
}

function afterSceneDefaults(rowId) {
  const row = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${rowId}"]`);
  const end = Number(row?.querySelector('.scene-end')?.value || 0);
  const next = row?.nextElementSibling?.nextElementSibling;
  const nextStart = Number(next?.querySelector?.('.scene-start')?.value || end + 4);
  const duration = Math.max(1, Math.min(4, nextStart - end || 4));
  return { start: end, end: end + duration, caption: '', narration: '', ...globalCaptionDesign() };
}

function addClip(clip = {}) {
  const rowId = `clip_${Date.now()}_${Math.round(Math.random() * 100000)}`;
  const tr = document.createElement('tr');
  tr.className = 'clip-row';
  tr.dataset.clipId = rowId;
  tr.draggable = true;
  tr.innerHTML = `
    <td class="drag-cell"><button type="button" class="drag-handle" title="Drag clip">☰</button></td>
    <td><select class="clip-placement"></select></td>
    <td><input type="number" step="0.25" min="0.5" class="clip-duration" value="${clip.durationSeconds || DEFAULT_CLIP_DURATION}" /></td>
    <td><select class="clip-mode">${renderOptions(CLIP_MODE_PRESETS, clip.mode || 'device-screen')}</select></td>
    <td><input name="${rowId}" type="file" class="clip-file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" /></td>
    <td><input class="clip-label" value="${escapeHtml(clip.label || '')}" placeholder="Optional" /></td>
    <td><button type="button" class="delete">×</button></td>
  `;
  tr.addEventListener('dragstart', (event) => {
    dragClipId = rowId;
    tr.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });
  tr.addEventListener('dragend', () => {
    dragClipId = '';
    tr.classList.remove('dragging');
    [...clipTableBody.querySelectorAll('.drag-over')].forEach(row => row.classList.remove('drag-over'));
  });
  tr.addEventListener('dragover', (event) => {
    if (!dragClipId || dragClipId === rowId) return;
    event.preventDefault();
    tr.classList.add('drag-over');
  });
  tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
  tr.addEventListener('drop', (event) => {
    event.preventDefault();
    moveClipRow(dragClipId, rowId);
  });
  tr.querySelector('.delete').addEventListener('click', () => tr.remove());
  clipTableBody.appendChild(tr);
  refreshClipPlacementOptions();
}

function moveClipRow(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const source = clipTableBody.querySelector(`tr.clip-row[data-clip-id="${sourceId}"]`);
  const target = clipTableBody.querySelector(`tr.clip-row[data-clip-id="${targetId}"]`);
  if (!source || !target) return;
  const beforeTarget = source.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING;
  if (beforeTarget) {
    target.after(source);
  } else {
    target.before(source);
  }
}

function refreshClipPlacementOptions() {
  const rows = sceneRows();
  const options = [
    { value: 'start', label: 'Start of video' },
    ...rows.map((row, index) => ({
      value: row.dataset.sceneId,
      label: `After scene ${index + 1}`,
    })),
  ];
  clipTableBody.querySelectorAll('.clip-placement').forEach((select) => {
    const previous = select.value;
    select.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
    const fallback = options.some((option) => option.value === selectedSceneId) ? selectedSceneId : (options[options.length - 1]?.value || 'start');
    select.value = options.some((option) => option.value === previous) ? previous : fallback;
  });
}

function loadSampleScenes() {
  sceneTableBody.innerHTML = '';
  selectedSceneId = '';
  [
    { start: 0, end: 4, caption: 'Story time,\njust got smarter', narration: 'Story time just got smarter.', background: 'reading-room', device: 'tablet-pro', angle: 'low-desk-left', motion: 'slow-push-in', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'editorial-card', captionPosition: 'top', captionAnimation: 'none', captionSize: 'large', captionAccent: 'last-word', captionAnimationAmount: 1.65 },
    { start: 4, end: 9, caption: 'the interactive story companion', narration: 'Meet the interactive story companion for young readers.', background: 'office-desk', device: 'laptop-silver', angle: 'front-center', motion: 'screen-focus', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'glass-card', captionPosition: 'top', captionAnimation: 'none', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.4 },
    { start: 9, end: 15, caption: 'listen', narration: 'Listen to every line with clear narration.', background: 'cafe-table', device: 'phone-modern', angle: 'floating-hero', motion: 'device-tilt', motionAmount: 2.2, screenZoom: 1, transition: 'slide-up', captionStyle: 'neon-ribbon', captionPosition: 'top', captionAnimation: 'none', captionSize: 'compact', captionAccent: 'first-word', captionAnimationAmount: 1.7 },
    { start: 15, end: 22, caption: 'and tap any word to\nhear it out', narration: 'Tap any word to hear it out and build confidence.', background: 'home-office', device: 'tablet-pro', angle: 'low-desk-right', motion: 'pan-left', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'bold-bottom', captionPosition: 'bottom', captionAnimation: 'none', captionSize: 'hero', captionAccent: 'last-word', captionAnimationAmount: 1.55 },
    { start: 22, end: 26, caption: 'built from your real product', narration: 'Built from your real website or software recording.', background: 'meeting-room', device: 'browser-window', angle: 'front-center', motion: 'pan-right', motionAmount: 2.2, screenZoom: 1, transition: 'clean-cut', captionStyle: 'minimal-subtitle', captionPosition: 'bottom', captionAnimation: 'none', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.2 },
    { start: 26, end: 30, caption: 'Try it free today', narration: 'Try it free today.', background: 'creator-studio', device: 'tablet-pro', angle: 'floating-hero', motion: 'cta-push', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'device-callout', captionPosition: 'device', captionAnimation: 'none', captionSize: 'large', captionAccent: 'first-word', captionAnimationAmount: 1.8 },
  ].forEach(addScene);
  refreshClipPlacementOptions();
}

function collectScenes() {
  const globalCaption = globalCaptionDesign();
  return [...sceneTableBody.querySelectorAll('tr.scene-main')].map(row => {
    const designRow = row.nextElementSibling;
    const words = parseWords(row.dataset.words);
    const hasCaptionOverride = designRow.querySelector('.scene-caption-override')?.checked;
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
      captionStyle: hasCaptionOverride ? checkedValue(designRow, '.scene-caption-style', globalCaption.captionStyle) : globalCaption.captionStyle,
      captionPosition: hasCaptionOverride ? designRow.querySelector('.scene-caption-position').value : globalCaption.captionPosition,
      captionAnimation: hasCaptionOverride ? designRow.querySelector('.scene-caption-animation').value : globalCaption.captionAnimation,
      captionSize: hasCaptionOverride ? designRow.querySelector('.scene-caption-size').value : globalCaption.captionSize,
      captionAccent: hasCaptionOverride ? designRow.querySelector('.scene-caption-accent').value : globalCaption.captionAccent,
      captionAnimationAmount: hasCaptionOverride ? Number(designRow.querySelector('.scene-caption-animation-amount').value || DEFAULT_DESIGN.captionAnimationAmount) : globalCaption.captionAnimationAmount,
      captionOverride: Boolean(hasCaptionOverride),
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
  const sceneTimings = sceneRows().map((row) => ({
    id: row.dataset.sceneId,
    start: Number(row.querySelector('.scene-start').value || 0),
    end: Number(row.querySelector('.scene-end').value || 0),
  }));
  const placementOffsets = new Map();
  return [...clipTableBody.querySelectorAll('tr.clip-row')].map(row => {
    const fileInput = row.querySelector('.clip-file');
    const placement = row.querySelector('.clip-placement').value;
    const baseStart = placement === 'start'
      ? 0
      : (sceneTimings.find((scene) => scene.id === placement)?.end ?? lastSceneEnd());
    const duration = Number(row.querySelector('.clip-duration').value || DEFAULT_CLIP_DURATION);
    const safeDuration = Math.max(0.5, duration);
    const offset = placementOffsets.get(placement) || 0;
    const start = baseStart + offset;
    placementOffsets.set(placement, offset + safeDuration);
    return {
      start,
      end: start + safeDuration,
      mode: row.querySelector('.clip-mode').value,
      label: row.querySelector('.clip-label').value.trim() || fileInput.files[0]?.name || 'Clip',
      fileField: fileInput.name,
    };
  }).filter((clip, index) => {
    const row = clipTableBody.querySelectorAll('tr.clip-row')[index];
    return clip.end > clip.start && row.querySelector('.clip-file').files.length > 0;
  });
}

function lastSceneEnd() {
  return Math.max(0, ...sceneRows().map(row => Number(row.querySelector('.scene-end').value || 0)));
}

function reflowSceneTimings() {
  let cursor = 0;
  sceneRows().forEach((row) => {
    const startInput = row.querySelector('.scene-start');
    const endInput = row.querySelector('.scene-end');
    const oldStart = Number(startInput.value || cursor);
    const oldEnd = Number(endInput.value || oldStart + 4);
    const duration = Math.max(0.5, oldEnd - oldStart);
    startInput.value = Number(cursor.toFixed(2));
    endInput.value = Number((cursor + duration).toFixed(2));
    shiftStoredWords(row, cursor - oldStart);
    cursor += duration;
  });
  refreshClipPlacementOptions();
}

function shiftStoredWords(row, delta) {
  if (!delta) return;
  const words = parseWords(row.dataset.words);
  if (!words.length) return;
  row.dataset.words = JSON.stringify(words.map((word) => ({
    ...word,
    start: Number((Number(word.start || 0) + delta).toFixed(3)),
    end: Number((Number(word.end || 0) + delta).toFixed(3)),
  })));
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
    selectedSceneId = '';
    data.scenes.forEach(addScene);
    if (data.durationSeconds && projectForm.elements.durationSeconds) {
      projectForm.elements.durationSeconds.value = Math.ceil(Number(data.durationSeconds));
    }
    refreshClipPlacementOptions();
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

document.querySelector('#addSceneBtn').addEventListener('click', () => addScene({ start: lastSceneEnd(), end: lastSceneEnd() + 4, ...globalCaptionDesign() }));
document.querySelector('#addSceneAfterBtn').addEventListener('click', () => {
  const afterId = selectedSceneId || sceneRows().at(-1)?.dataset.sceneId || '';
  addScene(afterId ? afterSceneDefaults(afterId) : { start: lastSceneEnd(), end: lastSceneEnd() + 4, ...globalCaptionDesign() }, { afterSceneId: afterId });
});
document.querySelector('#addClipBtn').addEventListener('click', () => addClip());
document.querySelector('#loadSampleBtn').addEventListener('click', loadSampleScenes);
document.querySelector('#reflowScenesBtn').addEventListener('click', reflowSceneTimings);
document.querySelector('#transcribeVoiceoverBtn').addEventListener('click', event => generateScenesFromVoiceover(event.target));
document.querySelector('#refreshProjectsBtn').addEventListener('click', loadProjects);

initGlobalCaptionControls();
loadSampleScenes();
loadProjects();
