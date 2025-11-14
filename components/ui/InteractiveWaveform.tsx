import React, { useRef, useEffect } from 'react';

// --- Default Configuration ---
// These can be overridden by props for customization
const DEFAULT_CONFIG = {
  barCount: 150, // Number of bars in the visualizer
  barColor1: 'rgba(155, 92, 255, 1)',  // brand-violet
  barColor2: 'rgba(0, 229, 255, 1)',   // brand-cyan
  barGlowColor: 'rgba(255, 255, 255, 1)',
  mouseRadius: 150, // The radius around the cursor that affects the bars
  mousePower: 3,    // How strongly the cursor pushes the bars up
  baseHeight: 0.1, // Minimum height of the bars (as a percentage of canvas height)
  pulseSpeed: 0.01, // Speed of the background pulsing animation
  pulseMagnitude: 0.1, // How much the bars pulse
};

interface InteractiveWaveformProps {
  barCount?: number;
  barColor1?: string;
  barColor2?: string;
  barGlowColor?: string;
  mouseRadius?: number;
  mousePower?: number;
  baseHeight?: number;
  pulseSpeed?: number;
  pulseMagnitude?: number;
  className?: string;
}

/**
 * --- DJBook Interactive Waveform ---
 * 
 * An interactive audio waveform visualizer that reacts to cursor movement.
 * It's optimized for performance using the HTML5 Canvas API.
 * 
 * --- Setup Instructions ---
 * 1. Import this component into your desired page (e.g., HomePage.tsx).
 *    `import InteractiveWaveform from './ui/InteractiveWaveform';`
 * 
 * 2. Place it inside a relatively positioned container. It should be positioned absolutely
 *    to sit behind other content.
 * 
 *    Example:
 *    ```jsx
 *    <section className="relative h-screen bg-brand-dark">
 *      <InteractiveWaveform />
 *      <div className="relative z-10">
 *        // Your hero text and other content here
 *      </div>
 *    </section>
 *    ```
 * 
 * 3. Customize the animation by passing props. If no props are passed, it will use the defaults.
 *    Example:
 *    `<InteractiveWaveform barCount={200} mousePower={5} />`
 */
const InteractiveWaveform: React.FC<InteractiveWaveformProps> = (props) => {
  const config = { ...DEFAULT_CONFIG, ...props };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  let frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame.current++;

      const barWidth = canvas.width / config.barCount;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, config.barColor1);
      gradient.addColorStop(1, config.barColor2);
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = config.barGlowColor;

      for (let i = 0; i < config.barCount; i++) {
        const barX = i * barWidth;
        
        // Calculate distance from cursor
        const dist = Math.hypot(barX - mouse.current.x * window.devicePixelRatio, canvas.height - mouse.current.y * window.devicePixelRatio);
        
        let excitement = 0;
        if (dist < config.mouseRadius * window.devicePixelRatio) {
          excitement = (1 - dist / (config.mouseRadius * window.devicePixelRatio)) * config.mousePower;
        }

        // Base pulsing animation
        const pulse = Math.sin(frame.current * config.pulseSpeed + i * 0.1) * config.pulseMagnitude + config.baseHeight;
        
        // Combine pulse and cursor excitement
        const barHeightPercentage = Math.max(0, pulse + excitement);
        const barHeight = canvas.height * barHeightPercentage;

        ctx.shadowBlur = Math.min(20, excitement * 10);
        ctx.fillRect(barX, canvas.height - barHeight, barWidth * 0.8, barHeight);
      }
      
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config]);

  return <canvas ref={canvasRef} className={props.className || "absolute top-0 left-0 w-full h-full"} />;
};

export default InteractiveWaveform;
