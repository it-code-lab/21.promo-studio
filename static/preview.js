const project = JSON.parse(document.querySelector('#projectData').textContent);
const stage = document.querySelector('#previewStage');
const screenVideo = document.querySelector('#screenVideo');
const backgroundImage = document.querySelector('#backgroundImage');
const logoImage = document.querySelector('#logoImage');
const captionChip = document.querySelector('#captionChip');
const ctaPill = document.querySelector('#ctaPill');
const replayBtn = document.querySelector('#replayBtn');
const cleanBtn = document.querySelector('#cleanBtn');
const sceneCamera = document.querySelector('.scene-camera');
const tabletStage = document.querySelector('.tablet-stage');
const captionStyleTray = document.querySelector('#captionStyleTray');
const captionPositionSelect = document.querySelector('#previewCaptionPosition');
const captionWordsInput = document.querySelector('#previewWordsPerGroup');
const captionWordsValue = document.querySelector('#previewWordsValue');
const captionHighlightSelect = document.querySelector('#previewHighlightMode');
const captionSizeSelect = document.querySelector('#previewCaptionSize');
const resetCaptionPreviewBtn = document.querySelector('#resetCaptionPreviewBtn');

const assetUrl = (path) => path ? `/preview-assets/${path}` : '';
const BACKGROUNDS = {
  'reading-room': 'assets/lifestyle-reading-room.png',
  'office-desk': 'assets/background-office-desk.png',
  'cafe-table': 'assets/background-cafe-table.png',
  'dark-studio': 'assets/background-dark-studio.png',
  'home-office': 'assets/background-home-office.png',
  'classroom': 'assets/background-classroom.png',
  'meeting-room': 'assets/background-meeting-room.png',
  'evening-desk': 'assets/background-evening-desk.png',
  'kitchen-counter': 'assets/background-kitchen-counter.png',
  'creator-studio': 'assets/background-creator-studio.png',
};
const DEFAULT_SCENE = {
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
const CAPTION_STYLE_PRESETS = [
  { id: 'white-chip', label: 'White chip', sample: 'Clean' },
  { id: 'glass-card', label: 'Glass card', sample: 'Glass' },
  { id: 'bold-bottom', label: 'Bold bottom', sample: 'Bold' },
  { id: 'editorial-card', label: 'Editorial card', sample: 'Editorial' },
  { id: 'neon-ribbon', label: 'Neon ribbon', sample: 'Accent' },
  { id: 'kinetic-stack', label: 'Kinetic stack', sample: 'Stack' },
  { id: 'minimal-subtitle', label: 'Minimal subtitle', sample: 'Subtitle' },
  { id: 'device-callout', label: 'Device callout', sample: 'Callout' },
  { id: 'creator-pop', label: 'Creator pop', sample: 'Viral' },
  { id: 'karaoke-card', label: 'Karaoke card', sample: 'Karaoke' },
];
const scenes = Array.isArray(project.scenes) ? project.scenes : [];
const duration = Math.max(5, Number(project.durationSeconds || 30));
const ctaStart = Math.max(0, duration - 5.6);
const captionTimeline = scenes.map((scene) => ({ scene, words: sceneWords(scene) }));
const previewSettingsKey = `promo-preview-captions:${project.id || 'default'}`;
let activeSceneKey = '';
let animationFrame = null;
let activeCaptionGroupKey = '';
let lastCaptionRenderKey = '';
let previewCaptionSettings = loadPreviewCaptionSettings();

stage.classList.remove('vertical', 'landscape', 'square');
stage.classList.add(project.format || 'vertical');
backgroundImage.src = assetUrl(BACKGROUNDS[DEFAULT_SCENE.background]);

if (project.assets?.screen) {
  screenVideo.src = assetUrl(project.assets.screen);
}

if (project.assets?.logo) {
  logoImage.src = assetUrl(project.assets.logo);
  logoImage.classList.remove('hidden');
}

ctaPill.textContent = project.cta || 'Try it free today';

function activeSceneEntry(seconds) {
  const entry = captionTimeline.find((item) => seconds >= Number(item.scene.start || 0) && seconds < Number(item.scene.end || 0)) || captionTimeline[captionTimeline.length - 1] || { scene: {}, words: [] };
  return { scene: { ...DEFAULT_SCENE, ...entry.scene }, words: entry.words };
}

function activeScene(seconds) {
  return activeSceneEntry(seconds).scene;
}

function sceneWords(scene) {
  const start = Number(scene.start || 0);
  const end = Math.max(start + 0.4, Number(scene.end || start + 3));
  const storedWords = Array.isArray(scene.words) ? scene.words : [];
  if (storedWords.length) {
    return storedWords
      .map((word) => ({
        text: cleanWord(word.text || word.word || ''),
        start: Number(word.start ?? start),
        end: Number(word.end ?? word.start ?? end),
      }))
      .filter((word) => word.text)
      .map((word, index, words) => ({
        ...word,
        start: Number.isFinite(word.start) ? word.start : start,
        end: Number.isFinite(word.end) && word.end > word.start ? word.end : (words[index + 1]?.start || end),
      }));
  }

  const source = String(scene.narration || scene.caption || project.title || '').replace(/\n+/g, ' ');
  const words = source.match(/[^\s]+/g) || [];
  const span = (end - start) / Math.max(1, words.length);
  return words.map((word, index) => ({
    text: cleanWord(word),
    start: start + index * span,
    end: start + (index + 1) * span,
  })).filter((word) => word.text);
}

function cleanWord(word) {
  return String(word || '').replace(/\s+/g, ' ').trim();
}

function setCaption(caption, scene, seconds, words = []) {
  const group = captionWordGroup(words, scene, seconds);
  const lines = group.words.length
    ? splitCaptionWords(group.words)
    : String(caption || project.title || '').split(/\n+/).filter(Boolean).map((line) => line.split(/\s+/).filter(Boolean));
  const groupKey = `${scene?.start || 0}|${group.words.map((word) => word.text).join(' ')}`;
  const renderKey = `${groupKey}|${group.activeIndex}|${previewCaptionSettings.highlightMode}|${stage.dataset.captionStyle}|${stage.dataset.captionPosition}|${stage.dataset.captionSize}`;

  if (lastCaptionRenderKey === renderKey) return;
  lastCaptionRenderKey = renderKey;

  if (activeCaptionGroupKey !== groupKey) {
    activeCaptionGroupKey = groupKey;
    captionChip.style.animation = 'none';
    void captionChip.offsetWidth;
    captionChip.style.animation = '';
  }

  captionChip.innerHTML = '';
  lines.forEach((lineWords) => {
    const line = document.createElement('span');
    line.className = 'caption-line';
    lineWords.forEach((word, index) => {
      const wordEl = document.createElement('i');
      const wordText = typeof word === 'string' ? word : word.text;
      wordEl.textContent = wordText;
      if (typeof word !== 'string') {
        wordEl.classList.toggle('is-active', word.index === group.activeIndex);
        wordEl.classList.toggle('is-past', word.index < group.activeIndex);
        wordEl.style.setProperty('--word-progress', String(wordProgress(word, seconds)));
      }
      line.appendChild(wordEl);
      if (index < lineWords.length - 1) {
        line.appendChild(document.createTextNode(' '));
      }
    });
    captionChip.appendChild(line);
  });
}

function captionWordGroup(words, scene, seconds) {
  const timedWords = words.length ? words : sceneWords(scene || {});
  if (!timedWords.length) return { words: [], activeIndex: -1 };
  const foundIndex = timedWords.findIndex((word, index) => {
    const nextStart = timedWords[index + 1]?.start ?? word.end;
    return seconds >= word.start && seconds < Math.max(word.end, nextStart);
  });
  const activeIndex = foundIndex === -1
    ? (seconds < timedWords[0].start ? 0 : timedWords.length - 1)
    : foundIndex;
  const wordsPerGroup = Number(previewCaptionSettings.wordsPerGroup || 3);
  const groupStart = Math.floor(activeIndex / wordsPerGroup) * wordsPerGroup;
  return {
    words: timedWords.slice(groupStart, groupStart + wordsPerGroup).map((word, offset) => ({ ...word, index: groupStart + offset })),
    activeIndex,
  };
}

function splitCaptionWords(words) {
  if (words.length <= 4) return [words];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint), words.slice(midpoint)];
}

function wordProgress(word, seconds) {
  const length = Math.max(0.08, Number(word.end || 0) - Number(word.start || 0));
  return Math.min(1, Math.max(0, (seconds - Number(word.start || 0)) / length));
}

function updatePreview() {
  const seconds = screenVideo.currentTime || 0;
  const entry = activeSceneEntry(seconds);
  const scene = entry.scene;
  applySceneDesign(scene);
  setCaption(scene?.caption || project.title, scene, seconds, entry.words);
  setTraySelected(effectiveCaptionStyle(scene));
  ctaPill.classList.toggle('hidden', seconds < ctaStart);

  if (seconds >= duration) {
    screenVideo.pause();
  } else {
    animationFrame = requestAnimationFrame(updatePreview);
  }
}

function applySceneDesign(scene) {
  const captionStyle = effectiveCaptionStyle(scene);
  const captionPosition = previewCaptionSettings.position || scene.captionPosition || DEFAULT_SCENE.captionPosition;
  const captionSize = previewCaptionSettings.size || scene.captionSize || DEFAULT_SCENE.captionSize;
  const sceneKey = [
    scene.start,
    scene.background,
    scene.device,
    scene.angle,
    scene.motion,
    scene.motionAmount,
    scene.transition,
    captionStyle,
    captionPosition,
    scene.captionAnimation,
    captionSize,
    scene.captionAccent,
    scene.captionAnimationAmount,
    previewCaptionSettings.wordsPerGroup,
    previewCaptionSettings.highlightMode,
  ].join('|');

  if (activeSceneKey !== sceneKey) {
    activeSceneKey = sceneKey;
    backgroundImage.src = assetUrl(BACKGROUNDS[scene.background] || BACKGROUNDS[DEFAULT_SCENE.background]);
    stage.dataset.transition = scene.transition || DEFAULT_SCENE.transition;
    stage.dataset.captionStyle = captionStyle;
    stage.dataset.captionPosition = captionPosition;
    stage.dataset.captionAnimation = scene.captionAnimation || DEFAULT_SCENE.captionAnimation;
    stage.dataset.captionSize = captionSize;
    stage.dataset.captionAccent = scene.captionAccent || DEFAULT_SCENE.captionAccent;
    stage.dataset.highlightMode = previewCaptionSettings.highlightMode || 'word';
    sceneCamera.dataset.motion = scene.motion || DEFAULT_SCENE.motion;
    tabletStage.dataset.device = scene.device || DEFAULT_SCENE.device;
    tabletStage.dataset.angle = scene.angle || DEFAULT_SCENE.angle;
    setCaptionMotionVars(scene);
    setCameraMotionVars(scene);
    sceneCamera.style.animation = 'none';
    captionChip.style.animation = 'none';
    void sceneCamera.offsetWidth;
    void captionChip.offsetWidth;
    sceneCamera.style.animation = '';
    captionChip.style.animation = '';
  }

  const localDuration = Math.max(0.5, Number(scene.end || duration) - Number(scene.start || 0));
  const localProgress = Math.min(1, Math.max(0, (screenVideo.currentTime - Number(scene.start || 0)) / localDuration));
  const zoomBase = Number(scene.screenZoom || DEFAULT_SCENE.screenZoom);
  screenVideo.style.transform = `translate3d(0, 0, 0) scale(${zoomBase})`;
}

function effectiveCaptionStyle(scene) {
  return previewCaptionSettings.style || scene.captionStyle || DEFAULT_SCENE.captionStyle;
}

function setCaptionMotionVars(scene) {
  const amount = clamp(Number(scene.captionAnimationAmount || DEFAULT_SCENE.captionAnimationAmount), 0.5, 2.2);
  captionChip.style.setProperty('--caption-rise-y', `${Math.round(16 * amount)}px`);
  captionChip.style.setProperty('--caption-pop-start', String(Math.max(0.76, 1 - (0.12 * amount))));
  captionChip.style.setProperty('--caption-slide-x', `${Math.round(-18 * amount)}px`);
  captionChip.style.setProperty('--caption-type-steps', '22');
}

function setCameraMotionVars(scene) {
  const amount = clamp(Number(scene.motionAmount || DEFAULT_SCENE.motionAmount), 0.5, 2.2);
  const motion = scene.motion || DEFAULT_SCENE.motion;
  const scale = (base) => Number((1 + base * amount).toFixed(4));
  const pct = (base) => `${Number((base * amount).toFixed(3))}%`;
  const vars = {
    '--camera-start-scale': 1,
    '--camera-end-scale': scale(0.06),
    '--camera-start-x': '0%',
    '--camera-end-x': '0%',
    '--camera-start-y': '0%',
    '--camera-mid-x': '0%',
    '--camera-mid-y': '0%',
    '--camera-late-x': '0%',
    '--camera-late-y': '0%',
    '--camera-end-y': pct(-1.2),
  };

  if (motion === 'screen-focus') {
    vars['--camera-start-scale'] = scale(0.02);
    vars['--camera-end-scale'] = scale(0.1);
    vars['--camera-end-y'] = pct(-2);
  } else if (motion === 'pan-left') {
    vars['--camera-start-scale'] = vars['--camera-end-scale'] = scale(0.06);
    vars['--camera-start-x'] = pct(2.2);
    vars['--camera-end-x'] = pct(-2.2);
    vars['--camera-end-y'] = pct(-1);
  } else if (motion === 'pan-right') {
    vars['--camera-start-scale'] = vars['--camera-end-scale'] = scale(0.06);
    vars['--camera-start-x'] = pct(-2.2);
    vars['--camera-end-x'] = pct(2.2);
    vars['--camera-end-y'] = pct(-1);
  } else if (motion === 'device-tilt') {
    vars['--camera-start-scale'] = scale(0.055);
    vars['--camera-mid-scale'] = scale(0.065);
    vars['--camera-late-scale'] = scale(0.06);
    vars['--camera-end-scale'] = scale(0.075);
    vars['--camera-mid-x'] = pct(0.7);
    vars['--camera-mid-y'] = pct(-0.7);
    vars['--camera-late-x'] = pct(-0.4);
    vars['--camera-late-y'] = pct(-1.2);
    vars['--camera-end-x'] = pct(0.2);
    vars['--camera-end-y'] = pct(-1.6);
  } else if (motion === 'cta-push') {
    vars['--camera-start-scale'] = scale(0.03);
    vars['--camera-end-scale'] = scale(0.12);
    vars['--camera-end-y'] = pct(-2.6);
  } else {
    vars['--camera-start-scale'] = scale(0.01);
  }

  Object.entries(vars).forEach(([name, value]) => {
    sceneCamera.style.setProperty(name, value);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : DEFAULT_SCENE.motionAmount));
}

function playFromStart() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  screenVideo.currentTime = 0;
  screenVideo.play();
  animationFrame = requestAnimationFrame(updatePreview);
}

function renderCaptionStyleTray() {
  if (!captionStyleTray) return;
  captionStyleTray.innerHTML = CAPTION_STYLE_PRESETS.map((preset) => `
    <button type="button" class="caption-style-pick ${preset.id}" data-style="${preset.id}">
      <span class="caption-style-preview"><b>${preset.sample}</b><em>Product</em></span>
      <span>${preset.label}</span>
    </button>
  `).join('');
  captionStyleTray.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const nextStyle = button.dataset.style || '';
      previewCaptionSettings.style = previewCaptionSettings.style === nextStyle ? '' : nextStyle;
      savePreviewCaptionSettings();
      activeSceneKey = '';
      updatePreview();
    });
  });
}

function setTraySelected(style) {
  if (!captionStyleTray) return;
  captionStyleTray.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.style === style);
    button.classList.toggle('override', Boolean(previewCaptionSettings.style) && button.dataset.style === style);
  });
}

function loadPreviewCaptionSettings() {
  const defaults = {
    style: '',
    position: '',
    wordsPerGroup: 3,
    highlightMode: 'word',
    size: '',
  };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(previewSettingsKey) || '{}') };
  } catch {
    return defaults;
  }
}

function savePreviewCaptionSettings() {
  localStorage.setItem(previewSettingsKey, JSON.stringify(previewCaptionSettings));
}

function syncCaptionControls() {
  if (captionPositionSelect) captionPositionSelect.value = previewCaptionSettings.position || '';
  if (captionWordsInput) captionWordsInput.value = String(previewCaptionSettings.wordsPerGroup || 3);
  if (captionWordsValue) captionWordsValue.textContent = String(previewCaptionSettings.wordsPerGroup || 3);
  if (captionHighlightSelect) captionHighlightSelect.value = previewCaptionSettings.highlightMode || 'word';
  if (captionSizeSelect) captionSizeSelect.value = previewCaptionSettings.size || '';
}

function wireCaptionControls() {
  syncCaptionControls();
  captionPositionSelect?.addEventListener('change', () => {
    previewCaptionSettings.position = captionPositionSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionWordsInput?.addEventListener('input', () => {
    previewCaptionSettings.wordsPerGroup = Number(captionWordsInput.value || 3);
    if (captionWordsValue) captionWordsValue.textContent = String(previewCaptionSettings.wordsPerGroup);
    savePreviewCaptionSettings();
    updatePreview();
  });
  captionHighlightSelect?.addEventListener('change', () => {
    previewCaptionSettings.highlightMode = captionHighlightSelect.value || 'word';
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionSizeSelect?.addEventListener('change', () => {
    previewCaptionSettings.size = captionSizeSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  resetCaptionPreviewBtn?.addEventListener('click', () => {
    previewCaptionSettings = {
      style: '',
      position: '',
      wordsPerGroup: 3,
      highlightMode: 'word',
      size: '',
    };
    savePreviewCaptionSettings();
    syncCaptionControls();
    activeSceneKey = '';
    activeCaptionGroupKey = '';
    lastCaptionRenderKey = '';
    updatePreview();
  });
}

screenVideo.addEventListener('loadedmetadata', () => {
  if (duration > screenVideo.duration && Number.isFinite(screenVideo.duration)) {
    screenVideo.loop = true;
  }
  playFromStart();
});

screenVideo.addEventListener('play', () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(updatePreview);
});
screenVideo.addEventListener('pause', updatePreview);
screenVideo.addEventListener('seeked', updatePreview);
replayBtn.addEventListener('click', playFromStart);

cleanBtn.addEventListener('click', () => {
  document.body.classList.toggle('clean');
  cleanBtn.textContent = document.body.classList.contains('clean') ? 'Show controls' : 'Clean view';
});

if (!project.assets?.screen) {
  setCaption(project.title, DEFAULT_SCENE, 0, []);
}

renderCaptionStyleTray();
wireCaptionControls();
