/**
 * Bíp Bíp 🐥 - Linh vật chính thức của Smart Study Planner
 * Một chú gà con chibi dễ thương với nhiều biểu cảm
 * 
 * Props:
 *  - size: number (default 80) — pixel size
 *  - mood: 'happy' | 'study' | 'sleep' | 'cheer' (default 'happy')
 *  - animate: boolean (default true) — enable idle animation
 *  - className: string — additional CSS classes
 *  - style: object — additional inline styles
 */
export default function Mascot({ size = 80, mood = 'happy', animate = true, className = '', style = {} }) {
  const s = size;
  const scale = s / 120; // base design is 120px

  // Eyes based on mood
  const getEyes = () => {
    switch (mood) {
      case 'sleep':
        return (
          <>
            {/* Closed eyes - zzz */}
            <path d={`M${42 * scale} ${52 * scale} Q${46 * scale} ${48 * scale} ${50 * scale} ${52 * scale}`} stroke="#4338ca" strokeWidth={2.5 * scale} fill="none" strokeLinecap="round" />
            <path d={`M${70 * scale} ${52 * scale} Q${74 * scale} ${48 * scale} ${78 * scale} ${52 * scale}`} stroke="#4338ca" strokeWidth={2.5 * scale} fill="none" strokeLinecap="round" />
          </>
        );
      case 'study':
        return (
          <>
            {/* Focused eyes - slightly squinted */}
            <ellipse cx={46 * scale} cy={50 * scale} rx={5 * scale} ry={6 * scale} fill="#1e1b4b" />
            <ellipse cx={74 * scale} cy={50 * scale} rx={5 * scale} ry={6 * scale} fill="#1e1b4b" />
            <circle cx={44 * scale} cy={48 * scale} r={2 * scale} fill="white" opacity={0.9} />
            <circle cx={72 * scale} cy={48 * scale} r={2 * scale} fill="white" opacity={0.9} />
            {/* Slight eyebrow for determination */}
            <path d={`M${38 * scale} ${40 * scale} L${52 * scale} ${38 * scale}`} stroke="#4338ca" strokeWidth={2 * scale} strokeLinecap="round" />
            <path d={`M${68 * scale} ${38 * scale} L${82 * scale} ${40 * scale}`} stroke="#4338ca" strokeWidth={2 * scale} strokeLinecap="round" />
          </>
        );
      case 'cheer':
        return (
          <>
            {/* Sparkly excited eyes */}
            <circle cx={46 * scale} cy={50 * scale} r={6 * scale} fill="#1e1b4b" />
            <circle cx={74 * scale} cy={50 * scale} r={6 * scale} fill="#1e1b4b" />
            <circle cx={44 * scale} cy={47 * scale} r={2.8 * scale} fill="white" opacity={0.95} />
            <circle cx={72 * scale} cy={47 * scale} r={2.8 * scale} fill="white" opacity={0.95} />
            <circle cx={48 * scale} cy={52 * scale} r={1.2 * scale} fill="white" opacity={0.6} />
            <circle cx={76 * scale} cy={52 * scale} r={1.2 * scale} fill="white" opacity={0.6} />
            {/* Star sparkles */}
            <text x={28 * scale} y={38 * scale} fontSize={10 * scale} style={{ filter: 'drop-shadow(0 0 2px gold)' }}>✦</text>
            <text x={84 * scale} y={36 * scale} fontSize={8 * scale} style={{ filter: 'drop-shadow(0 0 2px gold)' }}>✦</text>
          </>
        );
      default: // happy
        return (
          <>
            <circle cx={46 * scale} cy={50 * scale} r={5.5 * scale} fill="#1e1b4b" />
            <circle cx={74 * scale} cy={50 * scale} r={5.5 * scale} fill="#1e1b4b" />
            <circle cx={44 * scale} cy={48 * scale} r={2.5 * scale} fill="white" opacity={0.9} />
            <circle cx={72 * scale} cy={48 * scale} r={2.5 * scale} fill="white" opacity={0.9} />
          </>
        );
    }
  };

  // Mouth/beak based on mood
  const getMouth = () => {
    switch (mood) {
      case 'sleep':
        return (
          <ellipse cx={60 * scale} cy={63 * scale} rx={6 * scale} ry={3.5 * scale} fill="#f59e0b" />
        );
      case 'cheer':
        return (
          <>
            <ellipse cx={60 * scale} cy={64 * scale} rx={8 * scale} ry={5 * scale} fill="#f59e0b" />
            <path d={`M${54 * scale} ${65 * scale} Q${60 * scale} ${72 * scale} ${66 * scale} ${65 * scale}`} fill="#fb923c" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx={60 * scale} cy={63 * scale} rx={7 * scale} ry={4 * scale} fill="#f59e0b" />
            <path d={`M${55 * scale} ${64 * scale} Q${60 * scale} ${69 * scale} ${65 * scale} ${64 * scale}`} fill="#fb923c" />
          </>
        );
    }
  };

  // Cheek blush
  const getCheeks = () => {
    if (mood === 'sleep') return null;
    return (
      <>
        <ellipse cx={34 * scale} cy={58 * scale} rx={6 * scale} ry={4 * scale} fill="#fca5a5" opacity={0.5} />
        <ellipse cx={86 * scale} cy={58 * scale} rx={6 * scale} ry={4 * scale} fill="#fca5a5" opacity={0.5} />
      </>
    );
  };

  // Extras based on mood
  const getExtras = () => {
    switch (mood) {
      case 'sleep':
        return (
          <g className={animate ? 'mascot-zzz' : ''}>
            <text x={88 * scale} y={30 * scale} fontSize={12 * scale} fontWeight="900" fill="#a5b4fc" opacity={0.8}>z</text>
            <text x={96 * scale} y={20 * scale} fontSize={9 * scale} fontWeight="900" fill="#c7d2fe" opacity={0.6}>z</text>
            <text x={102 * scale} y={12 * scale} fontSize={7 * scale} fontWeight="900" fill="#e0e7ff" opacity={0.4}>z</text>
          </g>
        );
      case 'study':
        return (
          <>
            {/* Tiny book */}
            <rect x={82 * scale} y={72 * scale} width={20 * scale} height={15 * scale} rx={2 * scale} fill="#818cf8" />
            <rect x={84 * scale} y={74 * scale} width={16 * scale} height={11 * scale} rx={1 * scale} fill="#e0e7ff" />
            <line x1={92 * scale} y1={74 * scale} x2={92 * scale} y2={85 * scale} stroke="#c7d2fe" strokeWidth={1 * scale} />
          </>
        );
      case 'cheer':
        return (
          <>
            {/* Party effects */}
            <circle cx={25 * scale} cy={25 * scale} r={2 * scale} fill="#f472b6" className={animate ? 'mascot-sparkle' : ''} />
            <circle cx={95 * scale} cy={20 * scale} r={1.5 * scale} fill="#34d399" className={animate ? 'mascot-sparkle-delay' : ''} />
            <circle cx={100 * scale} cy={38 * scale} r={2 * scale} fill="#fbbf24" className={animate ? 'mascot-sparkle' : ''} />
            <circle cx={18 * scale} cy={40 * scale} r={1.5 * scale} fill="#60a5fa" className={animate ? 'mascot-sparkle-delay' : ''} />
          </>
        );
      default:
        return null;
    }
  };

  const animationClass = animate ? `mascot-idle mascot-mood-${mood}` : '';

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: s, height: s, ...style }}>
      <style>{`
        .mascot-idle {
          animation: mascotIdle 3s ease-in-out infinite;
        }
        .mascot-mood-sleep .mascot-idle,
        .mascot-mood-sleep {
          animation: mascotSleep 4s ease-in-out infinite;
        }
        .mascot-mood-cheer {
          animation: mascotCheer 0.6s ease-in-out infinite;
        }
        @keyframes mascotIdle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes mascotSleep {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(2px) rotate(-3deg); }
        }
        @keyframes mascotCheer {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(5deg); }
          75% { transform: translateY(-4px) rotate(-5deg); }
        }
        .mascot-zzz {
          animation: mascotZzz 2s ease-in-out infinite;
        }
        @keyframes mascotZzz {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-4px); }
        }
        .mascot-sparkle {
          animation: mascotSparkle 1.2s ease-in-out infinite;
        }
        .mascot-sparkle-delay {
          animation: mascotSparkle 1.2s ease-in-out 0.4s infinite;
        }
        @keyframes mascotSparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.5); }
        }
        .mascot-wing-left {
          animation: mascotWingLeft 1.5s ease-in-out infinite;
          transform-origin: top right;
        }
        .mascot-wing-right {
          animation: mascotWingRight 1.5s ease-in-out infinite;
          transform-origin: top left;
        }
        @keyframes mascotWingLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes mascotWingRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
        }
      `}</style>
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        className={animationClass}
      >
        {/* Body glow */}
        <ellipse cx={60 * scale} cy={70 * scale} rx={38 * scale} ry={36 * scale} fill="#fef3c7" opacity={0.4} />
        
        {/* Main body */}
        <ellipse cx={60 * scale} cy={65 * scale} rx={34 * scale} ry={32 * scale} fill="url(#bodyGrad)" />
        
        {/* Belly highlight */}
        <ellipse cx={60 * scale} cy={72 * scale} rx={22 * scale} ry={18 * scale} fill="#fef9c3" opacity={0.6} />
        
        {/* Left wing */}
        <g className={animate && mood === 'cheer' ? 'mascot-wing-left' : ''}>
          <ellipse cx={28 * scale} cy={60 * scale} rx={12 * scale} ry={16 * scale} fill="url(#wingGrad)" transform={`rotate(-15 ${28 * scale} ${60 * scale})`} />
        </g>
        
        {/* Right wing */}
        <g className={animate && mood === 'cheer' ? 'mascot-wing-right' : ''}>
          <ellipse cx={92 * scale} cy={60 * scale} rx={12 * scale} ry={16 * scale} fill="url(#wingGrad)" transform={`rotate(15 ${92 * scale} ${60 * scale})`} />
        </g>
        
        {/* Head tuft / crest */}
        <ellipse cx={54 * scale} cy={28 * scale} rx={4 * scale} ry={8 * scale} fill="#fbbf24" transform={`rotate(-15 ${54 * scale} ${28 * scale})`} />
        <ellipse cx={60 * scale} cy={26 * scale} rx={3.5 * scale} ry={9 * scale} fill="#f59e0b" />
        <ellipse cx={66 * scale} cy={28 * scale} rx={4 * scale} ry={8 * scale} fill="#fbbf24" transform={`rotate(15 ${66 * scale} ${28 * scale})`} />
        
        {/* Eyes */}
        {getEyes()}
        
        {/* Cheeks */}
        {getCheeks()}
        
        {/* Beak / Mouth */}
        {getMouth()}
        
        {/* Feet */}
        <ellipse cx={48 * scale} cy={96 * scale} rx={8 * scale} ry={3 * scale} fill="#f59e0b" />
        <ellipse cx={72 * scale} cy={96 * scale} rx={8 * scale} ry={3 * scale} fill="#f59e0b" />
        
        {/* Mood extras */}
        {getExtras()}
        
        {/* Gradients */}
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="70%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <radialGradient id="wingGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
