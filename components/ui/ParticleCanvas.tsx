import React, { useRef, useEffect } from 'react';

const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const CHARS = ['♪', '♫', '✨', '♩', '♬', '⭐', '💫'];
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const spawnParticle = (x: number, y: number) => {
            if (particlesRef.current.length > 100) return; // Performance cap
            particlesRef.current.push({
                x, y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -1 - Math.random() * 1.5,
                char: CHARS[Math.floor(Math.random() * CHARS.length)],
                size: 15 + Math.random() * 20,
                life: 1,
                rotation: (Math.random() - 0.5) * 0.5,
                hue: 180 + Math.random() * 60 // Shades of cyan/blue
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02; // gravity
                p.rotation += 0.01;
                p.life -= 0.01;
                
                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    continue;
                }
                
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.font = `${p.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 20;
                ctx.shadowColor = `hsl(${p.hue}, 80%, 60%)`;
                ctx.fillStyle = '#fff';
                ctx.fillText(p.char, 0, 0);
                ctx.restore();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            spawnParticle(e.clientX, e.clientY);
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch) spawnParticle(touch.clientX, touch.clientY);
        };

        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);
        
        resizeCanvas();
        animate();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

export default ParticleCanvas;
