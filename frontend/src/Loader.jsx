import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const STEPS = [
  'Initializing neural engine...',
  'Loading language models...',
  'Calibrating code analyzer...',
  'Warming up Gemini 2.5...',
  'Ready.',
];

export default function Loader({ onComplete }) {
  const wrapRef    = useRef(null);
  const logoRef    = useRef(null);
  const iconRef    = useRef(null);
  const titleRef   = useRef(null);
  const barRef     = useRef(null);
  const fillRef    = useRef(null);
  const stepRef    = useRef(null);
  const gridRef    = useRef(null);
  const orb1Ref    = useRef(null);
  const orb2Ref    = useRef(null);
  const pctRef     = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        gsap.to(wrapRef.current, {
          opacity: 0,
          scale: 1.04,
          duration: 0.55,
          ease: 'power2.inOut',
          onComplete,
        });
      }
    });

    // ── Ambient orbs float in
    tl.fromTo([orb1Ref.current, orb2Ref.current],
      { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', stagger: 0.2 },
      0
    );

    // ── Grid fade in
    tl.fromTo(gridRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      0
    );

    // ── Icon pops in with spring
    tl.fromTo(iconRef.current,
      { scale: 0, rotation: -20, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' },
      0.3
    );

    // ── Title slides up
    tl.fromTo(titleRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0.55
    );

    // ── Bar container appears
    tl.fromTo(barRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.out', transformOrigin: 'left' },
      0.75
    );

    // ── Progress fill + step text — sequence through 5 steps
    const stepDur  = 0.32;
    const stepGap  = 0.28;
    const obj      = { pct: 0 };

    STEPS.forEach((step, i) => {
      const targetPct = Math.round(((i + 1) / STEPS.length) * 100);
      const startAt   = 0.9 + i * (stepDur + stepGap);

      // Update step text
      tl.call(() => {
        if (stepRef.current)  stepRef.current.textContent  = step;
      }, [], startAt);

      // Animate fill width and percentage counter
      tl.to(obj, {
        pct: targetPct,
        duration: stepDur,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (fillRef.current) fillRef.current.style.width = `${obj.pct}%`;
          if (pctRef.current)  pctRef.current.textContent  = `${Math.round(obj.pct)}%`;
        },
      }, startAt);
    });

    // ── Icon pulse on complete
    tl.to(iconRef.current, {
      scale: 1.15, duration: 0.18, ease: 'power2.in', yoyo: true, repeat: 1
    }, '>-0.1');

    // ── Short hold at 100%
    tl.to({}, { duration: 0.45 });

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={wrapRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#07070e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Grid background */}
      <div ref={gridRef} style={{
        position: 'absolute', inset: 0, opacity: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Ambient orb 1 */}
      <div ref={orb1Ref} style={{
        position: 'absolute', top: '15%', left: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Ambient orb 2 */}
      <div ref={orb2Ref} style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + title */}
      <div ref={logoRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative' }}>

        {/* Icon */}
        <div ref={iconRef} style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,97,255,0.15))',
          border: '1px solid rgba(0,212,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          boxShadow: '0 0 40px rgba(0,212,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>⚡</div>

        {/* Title */}
        <div ref={titleRef} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 22, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#e8e8f0', letterSpacing: '-0.02em',
          }}>
            CodeSense <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #7b61ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AI</span>
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(136,136,160,0.7)',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4, letterSpacing: '0.12em',
          }}>INTELLIGENT CODE REVIEW</div>
        </div>
      </div>

      {/* Progress section */}
      <div style={{ marginTop: 44, width: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Bar */}
        <div ref={barRef} style={{
          height: 3, background: 'rgba(255,255,255,0.06)',
          borderRadius: 99, overflow: 'hidden', position: 'relative',
        }}>
          <div ref={fillRef} style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '0%', borderRadius: 99,
            background: 'linear-gradient(90deg, #00d4ff, #7b61ff)',
            boxShadow: '0 0 8px rgba(0,212,255,0.5)',
            transition: 'width 0.05s linear',
          }} />
        </div>

        {/* Step text + pct */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div ref={stepRef} style={{
            fontSize: 11, color: 'rgba(136,136,160,0.6)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>Initializing...</div>
          <div ref={pctRef} style={{
            fontSize: 11, color: 'rgba(0,212,255,0.7)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>0%</div>
        </div>
      </div>

    </div>
  );
}