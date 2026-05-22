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
];
const scenes = Array.isArray(project.scenes) ? project.scenes : [];
const duration = Math.max(5, Number(project.durationSeconds || 30));
const ctaStart = Math.max(0, duration - 5.6);
let activeSceneKey = '';
let animationFrame = null;
let previewCaptionStyleOverride = '';

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

function activeScene(seconds) {
  const scene = scenes.find((item) => seconds >= Number(item.start || 0) && seconds < Number(item.end || 0)) || scenes[scenes.length - 1] || {};
  return { ...DEFAULT_SCENE, ...scene };
}

function setCaption(caption, scene) {
  captionChip.innerHTML = '';
  String(caption || project.title || '').split(/\n+/).filter(Boolean).forEach((line) => {
    const span = document.createElement('span');
    appendAccentedText(span, line, scene?.captionAccent || DEFAULT_SCENE.captionAccent);
    captionChip.appendChild(span);
  });
}

function appendAccentedText(root, text, accent) {
  const words = String(text || '').split(/(\s+)/);
  const wordIndexes = words
    .map((part, index) => /\S/.test(part) ? index : -1)
    .filter(index => index >= 0);
  const accentIndex = accent === 'first-word'
    ? wordIndexes[0]
    : accent === 'last-word'
      ? wordIndexes[wordIndexes.length - 1]
      : -1;

  words.forEach((part, index) => {
    if (index === accentIndex) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      root.appendChild(mark);
    } else {
      root.appendChild(document.createTextNode(part));
    }
  });
}

function updatePreview() {
  const seconds = screenVideo.currentTime || 0;
  const scene = activeScene(seconds);
  applySceneDesign(scene);
  setCaption(scene?.caption || project.title, scene);
  setTraySelected(previewCaptionStyleOverride || scene.captionStyle || DEFAULT_SCENE.captionStyle);
  ctaPill.classList.toggle('hidden', seconds < ctaStart);

  if (seconds >= duration) {
    screenVideo.pause();
  } else {
    animationFrame = requestAnimationFrame(updatePreview);
  }
}

function applySceneDesign(scene) {
  const captionStyle = previewCaptionStyleOverride || scene.captionStyle || DEFAULT_SCENE.captionStyle;
  const sceneKey = [
    scene.start,
    scene.background,
    scene.device,
    scene.angle,
    scene.motion,
    scene.motionAmount,
    scene.transition,
    captionStyle,
    scene.captionPosition,
    scene.captionAnimation,
    scene.captionSize,
    scene.captionAccent,
    scene.captionAnimationAmount,
  ].join('|');

  if (activeSceneKey !== sceneKey) {
    activeSceneKey = sceneKey;
    backgroundImage.src = assetUrl(BACKGROUNDS[scene.background] || BACKGROUNDS[DEFAULT_SCENE.background]);
    stage.dataset.transition = scene.transition || DEFAULT_SCENE.transition;
    stage.dataset.captionStyle = captionStyle;
    stage.dataset.captionPosition = scene.captionPosition || DEFAULT_SCENE.captionPosition;
    stage.dataset.captionAnimation = scene.captionAnimation || DEFAULT_SCENE.captionAnimation;
    stage.dataset.captionSize = scene.captionSize || DEFAULT_SCENE.captionSize;
    stage.dataset.captionAccent = scene.captionAccent || DEFAULT_SCENE.captionAccent;
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
      previewCaptionStyleOverride = previewCaptionStyleOverride === nextStyle ? '' : nextStyle;
      activeSceneKey = '';
      updatePreview();
    });
  });
}

function setTraySelected(style) {
  if (!captionStyleTray) return;
  captionStyleTray.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.style === style);
    button.classList.toggle('override', Boolean(previewCaptionStyleOverride) && button.dataset.style === style);
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
  setCaption(project.title, DEFAULT_SCENE);
}

renderCaptionStyleTray();
