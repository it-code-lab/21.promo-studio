import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Loop,
  OffthreadVideo,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Scene = {
  start: number;
  end: number;
  caption: string;
  narration?: string;
  background?:
    | 'reading-room'
    | 'office-desk'
    | 'cafe-table'
    | 'dark-studio'
    | 'home-office'
    | 'classroom'
    | 'meeting-room'
    | 'evening-desk'
    | 'kitchen-counter'
    | 'creator-studio';
  device?: 'tablet-pro' | 'phone-modern' | 'laptop-silver' | 'browser-window';
  angle?: 'low-desk-left' | 'low-desk-right' | 'front-center' | 'floating-hero';
  motion?: 'slow-push-in' | 'screen-focus' | 'pan-left' | 'pan-right' | 'device-tilt' | 'cta-push';
  motionAmount?: number;
  screenZoom?: number;
  transition?: 'soft-fade' | 'clean-cut' | 'slide-up';
  captionStyle?: 'white-chip' | 'glass-card' | 'bold-bottom';
};

export type PromoProps = {
  title: string;
  productName: string;
  targetUrl?: string;
  cta: string;
  format: 'vertical' | 'landscape' | 'square';
  template: 'lifestyle' | 'tablet' | 'laptop' | 'phone';
  durationSeconds: number;
  fps: number;
  screenAsset: string;
  screenDurationSeconds?: number | null;
  voiceoverAsset?: string | null;
  logoAsset?: string | null;
  scenes: Scene[];
};

export const defaultPromoProps: PromoProps = {
  title: 'Premium Promo Video Studio',
  productName: 'Your Product',
  targetUrl: 'https://example.com',
  cta: 'Try it free today',
  format: 'vertical',
  template: 'lifestyle',
  durationSeconds: 30,
  fps: 30,
  screenAsset: 'sample-screen.mp4',
  screenDurationSeconds: null,
  voiceoverAsset: null,
  logoAsset: null,
  scenes: [
    {start: 0, end: 5, caption: 'Promote your product faster'},
    {start: 5, end: 12, caption: 'Use your real screen recording'},
    {start: 12, end: 22, caption: 'Add captions, motion, and CTA'},
    {start: 22, end: 30, caption: 'Try it free today'},
  ],
};

function activeScene(scenes: Scene[], seconds: number): Scene | undefined {
  return scenes.find((scene) => seconds >= scene.start && seconds < scene.end) || scenes[scenes.length - 1];
}

const sceneDefaults: Required<Omit<Scene, 'caption' | 'narration'>> = {
  start: 0,
  end: 30,
  background: 'reading-room',
  device: 'tablet-pro',
  angle: 'low-desk-left',
  motion: 'slow-push-in',
  motionAmount: 2.2,
  screenZoom: 1,
  transition: 'soft-fade',
  captionStyle: 'white-chip',
};

function designedScene(scenes: Scene[], seconds: number): Scene & typeof sceneDefaults {
  return {...sceneDefaults, ...(activeScene(scenes, seconds) || {caption: ''})};
}

function safeStatic(asset?: string | null): string | null {
  return asset ? staticFile(asset) : null;
}

const commonTextShadow = '0 8px 30px rgba(0,0,0,0.35)';
const backgroundAssets = {
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

export const PromoVideo: React.FC<PromoProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seconds = frame / fps;
  const scene = designedScene(props.scenes, seconds);
  const screenSrc = safeStatic(props.screenAsset);
  const voiceSrc = safeStatic(props.voiceoverAsset);
  const logoSrc = safeStatic(props.logoAsset);

  if (props.template === 'lifestyle') {
    return <LifestylePromo {...props} screenSrc={screenSrc} voiceSrc={voiceSrc} logoSrc={logoSrc} />;
  }

  const entrance = spring({frame, fps, config: {damping: 18, stiffness: 120}});
  const slowZoom = interpolate(frame, [0, fps * 30], [1.03, 1.12], {extrapolateRight: 'clamp'});
  const captionPop = spring({frame: frame % Math.max(1, fps * 4), fps, config: {damping: 16, stiffness: 160}});

  const isVertical = props.format === 'vertical';
  const isLandscape = props.format === 'landscape';
  const isSquare = props.format === 'square';

  const ctaVisible = seconds >= Math.max(0, props.durationSeconds - 6);

  return (
    <AbsoluteFill style={{backgroundColor: '#0f172a', overflow: 'hidden', fontFamily: 'Inter, Arial, sans-serif'}}>
      {screenSrc ? (
        <OffthreadVideo
          src={screenSrc}
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(34px) saturate(1.25)',
            opacity: 0.42,
            transform: `scale(${slowZoom})`,
          }}
        />
      ) : null}

      <AbsoluteFill style={{background: 'linear-gradient(155deg, rgba(15,23,42,.93), rgba(49,46,129,.62), rgba(8,47,73,.72))'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 10%, rgba(167,139,250,.45), transparent 28%), radial-gradient(circle at 86% 85%, rgba(34,211,238,.36), transparent 32%)'}} />

      <div style={{position: 'absolute', top: isLandscape ? 54 : isSquare ? 58 : 92, left: isLandscape ? 74 : 64, right: isLandscape ? 74 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          {logoSrc ? <Img src={logoSrc} style={{width: 62, height: 62, objectFit: 'contain', borderRadius: 16}} /> : <div style={{width: 54, height: 54, borderRadius: 18, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 18px 50px rgba(124,58,237,.35)'}} />}
          <div>
            <div style={{fontSize: isLandscape ? 26 : 28, color: 'rgba(255,255,255,.72)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase'}}>{props.productName}</div>
            {props.targetUrl ? <div style={{fontSize: isLandscape ? 18 : 20, color: 'rgba(226,232,240,.72)', marginTop: 4}}>{props.targetUrl.replace(/^https?:\/\//, '')}</div> : null}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: isLandscape ? 146 : isSquare ? 142 : 216,
        left: isLandscape ? 90 : 68,
        right: isLandscape ? 980 : 68,
        transform: `translateY(${interpolate(entrance, [0, 1], [40, 0])}px)`,
        opacity: entrance,
      }}>
        <div style={{fontSize: isLandscape ? 70 : isSquare ? 60 : 78, lineHeight: 0.96, fontWeight: 950, letterSpacing: '-0.06em', textShadow: commonTextShadow}}>
          {props.title}
        </div>
      </div>

      <DeviceStage
        screenSrc={screenSrc}
        template={props.template}
        format={props.format}
        frame={frame}
        fps={fps}
        width={width}
        height={height}
      />

      <div style={{
        position: 'absolute',
        left: isLandscape ? 92 : 72,
        right: isLandscape ? 92 : 72,
        bottom: isLandscape ? 72 : isSquare ? 76 : 170,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          maxWidth: isLandscape ? 760 : 880,
          padding: isLandscape ? '24px 34px' : '28px 38px',
          borderRadius: 34,
          background: 'rgba(15,23,42,.72)',
          border: '1px solid rgba(255,255,255,.18)',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 28px 80px rgba(0,0,0,.34)',
          transform: `scale(${interpolate(captionPop, [0, 1], [0.96, 1])})`,
          opacity: interpolate(captionPop, [0, 1], [0.3, 1]),
          textAlign: 'center',
        }}>
          <div style={{fontSize: isLandscape ? 42 : isSquare ? 42 : 54, lineHeight: 1.08, fontWeight: 950, letterSpacing: '-0.035em'}}>
            {scene?.caption || props.cta}
          </div>
        </div>
      </div>

      {ctaVisible ? <CtaEndCard cta={props.cta} isLandscape={isLandscape} /> : null}
      {voiceSrc ? <Audio src={voiceSrc} /> : null}
    </AbsoluteFill>
  );
};

const LifestylePromo: React.FC<PromoProps & {screenSrc: string | null; voiceSrc: string | null; logoSrc: string | null}> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const scene = designedScene(props.scenes, seconds);
  const isLandscape = props.format === 'landscape';
  const isSquare = props.format === 'square';
  const ctaStartSeconds = Math.max(0, props.durationSeconds - 5.6);
  const ctaVisible = seconds >= ctaStartSeconds;
  const progress = frame / Math.max(1, props.durationSeconds * fps);
  const bgScale = interpolate(progress, [0, 1], [1.02, 1.08], {extrapolateRight: 'clamp'});

  const captionFrame = Math.max(0, frame - Math.round((scene?.start || 0) * fps));
  const captionIn = spring({frame: captionFrame, fps, config: {damping: 18, stiffness: 170}});
  const transitionIn = scene.transition === 'clean-cut'
    ? 1
    : interpolate(captionFrame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const transitionY = scene.transition === 'slide-up'
    ? interpolate(transitionIn, [0, 1], [72, 0])
    : 0;
  const sceneFrame = Math.max(0, frame - Math.round(scene.start * fps));
  const sceneFrames = Math.max(1, Math.round((scene.end - scene.start) * fps));
  const sceneProgress = Math.min(1, sceneFrame / sceneFrames);
  const camera = cameraTransform(scene.motion, sceneProgress, scene.motionAmount);

  return (
    <AbsoluteFill style={{backgroundColor: '#eee2cf', overflow: 'hidden', fontFamily: 'Inter, Arial, sans-serif'}}>
      <AbsoluteFill style={{transform: `${camera} translateY(${transitionY}px)`, opacity: transitionIn}}>
        <Img
          src={staticFile(backgroundAssets[scene.background] || backgroundAssets['reading-room'])}
          style={{
            position: 'absolute',
            inset: '-2%',
            width: '104%',
            height: '104%',
            objectFit: 'cover',
            transform: `scale(${bgScale}) translateY(${isLandscape ? '-5%' : '0%'})`,
            filter: 'saturate(1.02) contrast(1.02)',
          }}
        />
        <AbsoluteFill
          style={{
            background: isLandscape
              ? 'linear-gradient(90deg, rgba(255,255,255,.3), rgba(255,255,255,0) 42%, rgba(57,39,24,.14))'
              : 'linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 34%, rgba(81,52,24,.18))',
          }}
        />
        <LifestyleDeviceStage
          screenSrc={props.screenSrc}
          format={props.format}
          scene={scene}
          transitionOpacity={1}
          screenLoopFrames={props.screenDurationSeconds ? Math.max(2, Math.round(props.screenDurationSeconds * fps)) : undefined}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
        }}
      />

      {props.logoSrc ? (
        <Img
          src={props.logoSrc}
          style={{
            position: 'absolute',
            top: isLandscape ? 42 : 78,
            left: isLandscape ? 52 : 48,
            width: isLandscape ? 64 : 74,
            height: isLandscape ? 64 : 74,
            objectFit: 'contain',
            borderRadius: 16,
            background: 'rgba(255,255,255,.78)',
            padding: 9,
            boxShadow: '0 12px 40px rgba(71,51,27,.18)',
          }}
        />
      ) : null}

      <div
        style={{
          position: 'absolute',
          top: scene.captionStyle === 'bold-bottom' ? 'auto' : isLandscape ? 70 : isSquare ? 70 : 84,
          bottom: scene.captionStyle === 'bold-bottom' ? (isLandscape ? 88 : isSquare ? 90 : 230) : 'auto',
          left: isLandscape ? 160 : 74,
          right: isLandscape ? 960 : 74,
          display: 'flex',
          justifyContent: isLandscape ? 'flex-start' : 'center',
          transform: `translateY(${interpolate(captionIn, [0, 1], [22, 0])}px) scale(${interpolate(captionIn, [0, 1], [0.97, 1])})`,
          opacity: interpolate(captionIn, [0, 1], [0, 1]),
        }}
      >
        <CaptionChip caption={scene?.caption || props.title} isLandscape={isLandscape} captionStyle={scene.captionStyle} />
      </div>

      {ctaVisible ? <LifestyleCta cta={props.cta} isLandscape={isLandscape} isSquare={isSquare} startFrame={Math.round(ctaStartSeconds * fps)} /> : null}
      {props.voiceSrc ? <Audio src={props.voiceSrc} /> : null}
    </AbsoluteFill>
  );
};

const CaptionChip: React.FC<{caption: string; isLandscape: boolean; captionStyle: Scene['captionStyle']}> = ({caption, isLandscape, captionStyle}) => {
  const lines = String(caption || '').split(/\n+/).filter(Boolean);
  const isGlass = captionStyle === 'glass-card';
  const isBottom = captionStyle === 'bold-bottom';
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        maxWidth: isLandscape ? 560 : 900,
      }}
    >
      {(lines.length ? lines : [caption]).map((line, index) => (
        <div
          key={`${line}-${index}`}
          style={{
            color: isGlass || isBottom ? 'white' : '#171717',
            borderRadius: 10,
            padding: isLandscape ? '8px 18px 10px' : '10px 19px 12px',
            fontSize: isBottom ? (isLandscape ? 48 : 58) : isLandscape ? 38 : 48,
            lineHeight: 1.04,
            fontWeight: 850,
            letterSpacing: 0,
            textAlign: 'center',
            boxShadow: isBottom ? 'none' : '0 12px 34px rgba(64,43,20,.16)',
            background: isBottom ? 'transparent' : isGlass ? 'rgba(15,23,42,.58)' : 'rgba(255,255,255,.94)',
            textShadow: isBottom ? '0 8px 34px rgba(0,0,0,.52)' : 'none',
            backdropFilter: isGlass ? 'blur(14px)' : undefined,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const LifestyleDeviceStage: React.FC<{
  screenSrc: string | null;
  format: PromoProps['format'];
  scene: Scene & typeof sceneDefaults;
  transitionOpacity: number;
  screenLoopFrames?: number;
}> = ({screenSrc, format, scene, transitionOpacity, screenLoopFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isLandscape = format === 'landscape';
  const isSquare = format === 'square';
  const intro = spring({frame: frame - 8, fps, config: {damping: 18, stiffness: 95}});
  const sceneFrame = Math.max(0, frame - Math.round(scene.start * fps));
  const sceneFrames = Math.max(1, Math.round((scene.end - scene.start) * fps));
  const sceneProgress = sceneFrame / sceneFrames;
  const pushIn = interpolate(intro, [0, 1], [0.9, 1]);

  const stageStyle: React.CSSProperties = isLandscape
    ? {position: 'absolute', right: 115, bottom: 36, width: 940, height: 660}
    : isSquare
      ? {position: 'absolute', left: 86, right: 86, bottom: 80, height: 690}
      : {position: 'absolute', left: -82, right: -82, bottom: 178, height: 890};

  return (
    <div
      style={{
        ...stageStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1400,
        transform: `scale(${pushIn})`,
        opacity: intro * transitionOpacity,
      }}
    >
      <div
        style={{
          ...deviceShellStyle(scene.device, isLandscape, isSquare),
          boxShadow: '0 38px 82px rgba(50,31,14,.28), 0 72px 130px rgba(38,24,12,.26)',
          transform: angleTransform(scene.angle, scene.device, isLandscape, isSquare),
          transformStyle: 'preserve-3d',
          border: '2px solid rgba(255,255,255,.24)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: deviceInset(scene.device, isLandscape),
            borderRadius: deviceRadius(scene.device, isLandscape),
            overflow: 'hidden',
            background: '#f8fafc',
          }}
        >
          <ScreenVideo
            screenSrc={screenSrc}
            radius={deviceRadius(scene.device, isLandscape)}
            zoom={Number(scene.screenZoom || sceneDefaults.screenZoom)}
            loopFrames={screenLoopFrames}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: deviceGlassInset(scene.device, isLandscape),
            borderRadius: deviceRadius(scene.device, isLandscape) + 4,
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.18), inset 0 0 22px rgba(255,255,255,.16)',
            background: 'linear-gradient(110deg, rgba(255,255,255,.20), rgba(255,255,255,0) 34%, rgba(255,255,255,.10) 64%, rgba(255,255,255,0))',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

const LifestyleCta: React.FC<{cta: string; isLandscape: boolean; isSquare: boolean; startFrame: number}> = ({cta, isLandscape, isSquare, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - startFrame, fps, config: {damping: 15, stiffness: 140}});
  return (
    <div
      style={{
        position: 'absolute',
        left: isLandscape ? 160 : 0,
        right: isLandscape ? 'auto' : 0,
        bottom: isLandscape ? 72 : isSquare ? 54 : 74,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#2f91ff',
          color: 'white',
          borderRadius: 999,
          padding: isLandscape ? '10px 25px 12px' : '13px 30px 15px',
          fontSize: isLandscape ? 34 : 39,
          lineHeight: 1,
          fontWeight: 760,
          letterSpacing: 0,
          boxShadow: '0 18px 42px rgba(35,112,214,.32)',
          transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px) scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
          opacity: interpolate(pop, [0, 1], [0, 1]),
        }}
      >
        {cta}
      </div>
    </div>
  );
};

const DeviceStage: React.FC<{
  screenSrc: string | null;
  template: PromoProps['template'];
  format: PromoProps['format'];
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({screenSrc, template, format, frame, fps}) => {
  const isLandscape = format === 'landscape';
  const isSquare = format === 'square';
  const deviceIn = spring({frame: frame - 10, fps, config: {damping: 18, stiffness: 95}});
  const floatY = Math.sin(frame / 38) * 8;
  const rotate = template === 'phone' ? -3 : template === 'laptop' ? 0 : -2;

  const stageStyle: React.CSSProperties = isLandscape
    ? {position: 'absolute', right: 78, top: 150, width: 940, height: 720}
    : isSquare
      ? {position: 'absolute', left: 90, right: 90, top: 260, height: 510}
      : {position: 'absolute', left: 72, right: 72, top: 560, height: 800};

  return (
    <div style={{...stageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${floatY}px) scale(${interpolate(deviceIn, [0, 1], [0.88, 1])}) rotate(${rotate}deg)`, opacity: deviceIn}}>
      {template === 'phone' ? <PhoneMock screenSrc={screenSrc} /> : template === 'laptop' ? <LaptopMock screenSrc={screenSrc} /> : <TabletMock screenSrc={screenSrc} />}
    </div>
  );
};

function deviceShellStyle(device: NonNullable<Scene['device']>, isLandscape: boolean, isSquare: boolean): React.CSSProperties {
  if (device === 'phone-modern') {
    return {
      width: isLandscape ? 330 : isSquare ? 320 : 420,
      aspectRatio: '9 / 19.2',
      padding: isLandscape ? 14 : 18,
      borderRadius: 58,
      background: 'linear-gradient(145deg, #202020, #050505 62%, #444)',
    };
  }
  if (device === 'laptop-silver') {
    return {
      width: isLandscape ? 820 : isSquare ? 760 : 900,
      aspectRatio: '16 / 10',
      padding: isLandscape ? 16 : 20,
      borderRadius: '34px 34px 16px 16px',
      background: 'linear-gradient(145deg, #263241, #06080c 58%, #3a4654)',
      boxShadow: '0 32px 70px rgba(0,0,0,0.48), inset 0 0 0 3px rgba(255,255,255,0.06)',
    };
  }
  if (device === 'browser-window') {
    return {
      width: isLandscape ? 820 : isSquare ? 760 : 900,
      aspectRatio: '16 / 10',
      padding: isLandscape ? '46px 16px 16px' : '56px 20px 20px',
      borderRadius: 28,
      background: 'linear-gradient(#111827 0 15%, #05070b 15%)',
      boxShadow: '0 32px 70px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.07)',
    };
  }
  return {
    width: isLandscape ? 830 : isSquare ? 760 : 920,
    aspectRatio: '1.42 / 1',
    padding: isLandscape ? 18 : 22,
    borderRadius: isLandscape ? 44 : 54,
    background: 'linear-gradient(145deg, #262626, #050505 58%, #333)',
  };
}

function angleTransform(angle: NonNullable<Scene['angle']>, device: NonNullable<Scene['device']>, isLandscape: boolean, isSquare: boolean): string {
  if (angle === 'front-center') return device === 'phone-modern' ? 'rotateX(10deg) rotateZ(0deg)' : 'rotateX(24deg) rotateZ(0deg)';
  if (angle === 'floating-hero') return device === 'phone-modern' ? 'rotateX(5deg) rotateZ(-5deg)' : 'rotateX(8deg) rotateZ(-4deg)';
  if (angle === 'low-desk-right') return device === 'phone-modern' ? 'rotateX(24deg) rotateZ(6deg)' : 'rotateX(54deg) rotateZ(7deg)';
  if (device === 'phone-modern') return 'rotateX(24deg) rotateZ(-6deg)';
  return isLandscape ? 'rotateX(58deg) rotateZ(-7deg)' : isSquare ? 'rotateX(55deg) rotateZ(-8deg)' : 'rotateX(54deg) rotateZ(-9deg)';
}

function cameraTransform(motion: NonNullable<Scene['motion']>, progress: number, motionAmount = sceneDefaults.motionAmount): string {
  const amount = Math.min(2.2, Math.max(0.5, Number.isFinite(motionAmount) ? motionAmount : sceneDefaults.motionAmount));
  const scale = (base: number) => 1 + base * amount;
  const px = (base: number) => base * amount;
  if (motion === 'screen-focus') {
    return `scale(${interpolate(progress, [0, 1], [scale(0.02), scale(0.1)])}) translateY(${interpolate(progress, [0, 1], [0, px(-22)])}px)`;
  }
  if (motion === 'pan-left') {
    return `scale(${scale(0.06)}) translate(${interpolate(progress, [0, 1], [px(24), px(-24)])}px, ${interpolate(progress, [0, 1], [0, px(-12)])}px)`;
  }
  if (motion === 'pan-right') {
    return `scale(${scale(0.06)}) translate(${interpolate(progress, [0, 1], [px(-24), px(24)])}px, ${interpolate(progress, [0, 1], [0, px(-12)])}px)`;
  }
  if (motion === 'device-tilt') {
    return `scale(${interpolate(progress, [0, 1], [scale(0.055), scale(0.075)])}) translate(${Math.sin(progress * Math.PI * 2) * px(5)}px, ${interpolate(progress, [0, 1], [0, px(-18)])}px)`;
  }
  if (motion === 'cta-push') {
    return `scale(${interpolate(progress, [0, 1], [scale(0.03), scale(0.12)])}) translateY(${interpolate(progress, [0, 1], [0, px(-28)])}px)`;
  }
  return `scale(${interpolate(progress, [0, 1], [scale(0.01), scale(0.07)])}) translateY(${interpolate(progress, [0, 1], [0, px(-14)])}px)`;
}

function deviceInset(device: NonNullable<Scene['device']>, isLandscape: boolean): number | string {
  if (device === 'browser-window') return isLandscape ? '46px 16px 16px' : '56px 20px 20px';
  return isLandscape ? 18 : 22;
}

function deviceGlassInset(device: NonNullable<Scene['device']>, isLandscape: boolean): number | string {
  if (device === 'browser-window') return isLandscape ? '42px 12px 12px' : '52px 16px 16px';
  return isLandscape ? 14 : 18;
}

function deviceRadius(device: NonNullable<Scene['device']>, isLandscape: boolean): number {
  if (device === 'phone-modern') return isLandscape ? 28 : 38;
  if (device === 'laptop-silver') return 18;
  if (device === 'browser-window') return 18;
  return isLandscape ? 30 : 36;
}

const ScreenVideo: React.FC<{screenSrc: string | null; radius: number; zoom?: number; loopFrames?: number}> = ({screenSrc, radius, zoom = 1, loopFrames}) => {
  if (!screenSrc) {
    return <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: radius}} />;
  }
  const video = (
    <Video
      src={screenSrc}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: radius,
        transform: `translate3d(0, 0, 0) scale(${zoom})`,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    />
  );
  return loopFrames && loopFrames > 1 ? <Loop durationInFrames={loopFrames}>{video}</Loop> : video;
};

const TabletMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{width: '92%', maxWidth: 900, aspectRatio: '1.35 / 1', padding: 24, borderRadius: 54, background: 'linear-gradient(145deg, #f8fafc, #cbd5e1)', boxShadow: '0 54px 120px rgba(0,0,0,.48)', border: '2px solid rgba(255,255,255,.6)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: '#0f172a', boxShadow: 'inset 0 0 0 2px rgba(15,23,42,.22)'}}>
      <ScreenVideo screenSrc={screenSrc} radius={34} />
    </div>
  </div>
);

const LaptopMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{width: '96%', maxWidth: 980}}>
    <div style={{padding: 20, borderRadius: '34px 34px 18px 18px', background: 'linear-gradient(145deg, #e2e8f0, #94a3b8)', boxShadow: '0 54px 120px rgba(0,0,0,.5)'}}>
      <div style={{height: 34, display: 'flex', gap: 9, alignItems: 'center', paddingLeft: 12}}>
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#ef4444'}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#f59e0b'}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#22c55e'}} />
      </div>
      <div style={{aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: '#020617'}}>
        <ScreenVideo screenSrc={screenSrc} radius={18} />
      </div>
    </div>
    <div style={{height: 34, width: '108%', marginLeft: '-4%', borderRadius: '0 0 48px 48px', background: 'linear-gradient(180deg,#cbd5e1,#64748b)', boxShadow: '0 35px 70px rgba(0,0,0,.36)'}} />
  </div>
);

const PhoneMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{height: '96%', aspectRatio: '9 / 18.5', padding: 18, borderRadius: 66, background: 'linear-gradient(145deg,#f8fafc,#64748b)', boxShadow: '0 54px 120px rgba(0,0,0,.5)'}}>
    <div style={{height: '100%', borderRadius: 46, overflow: 'hidden', background: '#020617', position: 'relative'}}>
      <div style={{position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', width: 110, height: 24, borderRadius: 999, background: '#020617', zIndex: 5}} />
      <ScreenVideo screenSrc={screenSrc} radius={46} />
    </div>
  </div>
);

const CtaEndCard: React.FC<{cta: string; isLandscape: boolean}> = ({cta, isLandscape}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - fps * 24, fps, config: {damping: 14, stiffness: 120}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{
        padding: isLandscape ? '34px 58px' : '42px 58px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        color: 'white',
        fontSize: isLandscape ? 50 : 64,
        fontWeight: 950,
        letterSpacing: '-0.045em',
        boxShadow: '0 36px 110px rgba(6,182,212,.35)',
        transform: `scale(${interpolate(pop, [0, 1], [0.72, 1])})`,
        opacity: interpolate(pop, [0, 1], [0, 1]),
      }}>
        {cta}
      </div>
    </AbsoluteFill>
  );
};
