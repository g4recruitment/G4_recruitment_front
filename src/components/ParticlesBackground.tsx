import { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
    type: "regular" | "luxury";
}

interface Orb {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    opacity: number;
    pulsePhase: number;
    pulseSpeed: number;
}

interface Dust {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    maxOpacity: number;
}

// Per-variant tuning. luxury = gold bokeh + ember dust; comfort = blue/cyan
// ambient orbs + azure drift. Same animation, only these numbers/colors differ.
interface VariantConfig {
    orb: {
        countMobile: number;
        countDesktop: number;
        radiusBase: number;
        radiusRange: number;
        mobileScale: number;
        speed: number;
        opacityBase: number;
        opacityRange: number;
        pulseSpeedBase: number;
        pulseSpeedRange: number;
        pulseAmp: number;
        // RGB triplets for the radial gradient stops (alpha applied at draw time).
        rgbInner: string;
        rgbMid: string;
        rgbOuter: string;
        midStop: number;
        midAlphaMul: number;
    };
    dust: {
        countMobile: number;
        countDesktop: number;
        sizeBase: number;
        sizeRange: number;
        speedYBase: number;
        speedYRange: number;
        speedX: number;
        opacityBase: number;
        opacityRange: number;
        maxOpacityBase: number;
        maxOpacityRange: number;
        rgb: string;
    };
}

const CONFIGS: Record<"luxury" | "comfort", VariantConfig> = {
    luxury: {
        orb: {
            countMobile: 4, countDesktop: 7,
            radiusBase: 140, radiusRange: 220, mobileScale: 0.6,
            speed: 0.12, opacityBase: 0.025, opacityRange: 0.055,
            pulseSpeedBase: 0.001, pulseSpeedRange: 0.003, pulseAmp: 0.28,
            rgbInner: "201, 168, 76", rgbMid: "201, 168, 76", rgbOuter: "201, 168, 76", midStop: 0.45, midAlphaMul: 0.38,
        },
        dust: {
            countMobile: 22, countDesktop: 45,
            sizeBase: 0.4, sizeRange: 1.2,
            speedYBase: 0.08, speedYRange: 0.35, speedX: 0.12,
            opacityBase: 0.1, opacityRange: 0.45,
            maxOpacityBase: 0.15, maxOpacityRange: 0.45,
            rgb: "201, 168, 76",
        },
    },
    comfort: {
        orb: {
            countMobile: 3, countDesktop: 5,
            radiusBase: 160, radiusRange: 260, mobileScale: 0.65,
            speed: 0.14, opacityBase: 0.02, opacityRange: 0.055,
            pulseSpeedBase: 0.001, pulseSpeedRange: 0.0028, pulseAmp: 0.22,
            rgbInner: "59, 130, 246", rgbMid: "56, 189, 248", rgbOuter: "14, 165, 233", midStop: 0.42, midAlphaMul: 0.32,
        },
        dust: {
            countMobile: 20, countDesktop: 38,
            sizeBase: 0.3, sizeRange: 1.0,
            speedYBase: 0.06, speedYRange: 0.28, speedX: 0.1,
            opacityBase: 0.08, opacityRange: 0.38,
            maxOpacityBase: 0.1, maxOpacityRange: 0.38,
            rgb: "125, 211, 252",
        },
    },
};

export const ParticlesBackground = ({ type }: ParticlesBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const cfg = CONFIGS[type === "luxury" ? "luxury" : "comfort"];
        const isMobile = window.innerWidth < 768;

        const orbCount = isMobile ? cfg.orb.countMobile : cfg.orb.countDesktop;
        const orbs: Orb[] = Array.from({ length: orbCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: (Math.random() * cfg.orb.radiusRange + cfg.orb.radiusBase) * (isMobile ? cfg.orb.mobileScale : 1),
            speedX: (Math.random() - 0.5) * cfg.orb.speed,
            speedY: (Math.random() - 0.5) * cfg.orb.speed,
            opacity: Math.random() * cfg.orb.opacityRange + cfg.orb.opacityBase,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * cfg.orb.pulseSpeedRange + cfg.orb.pulseSpeedBase,
        }));

        const dustCount = isMobile ? cfg.dust.countMobile : cfg.dust.countDesktop;
        const dust: Dust[] = Array.from({ length: dustCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * cfg.dust.sizeRange + cfg.dust.sizeBase,
            speedY: -(Math.random() * cfg.dust.speedYRange + cfg.dust.speedYBase),
            speedX: (Math.random() - 0.5) * cfg.dust.speedX,
            opacity: Math.random() * cfg.dust.opacityRange + cfg.dust.opacityBase,
            maxOpacity: Math.random() * cfg.dust.maxOpacityRange + cfg.dust.maxOpacityBase,
        }));

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            orbs.forEach(orb => {
                orb.x += orb.speedX;
                orb.y += orb.speedY;
                orb.pulsePhase += orb.pulseSpeed;

                if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
                if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
                if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

                const pulsed = orb.opacity * (1 + cfg.orb.pulseAmp * Math.sin(orb.pulsePhase));

                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                grad.addColorStop(0, `rgba(${cfg.orb.rgbInner}, ${pulsed})`);
                grad.addColorStop(cfg.orb.midStop, `rgba(${cfg.orb.rgbMid}, ${pulsed * cfg.orb.midAlphaMul})`);
                grad.addColorStop(1, `rgba(${cfg.orb.rgbOuter}, 0)`);

                ctx.beginPath();
                ctx.fillStyle = grad;
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            dust.forEach(d => {
                d.y += d.speedY;
                d.x += d.speedX;

                const yRatio = d.y / canvas.height;
                if (yRatio > 0.85) {
                    d.opacity = d.maxOpacity * ((1 - yRatio) / 0.15);
                } else if (yRatio < 0.08) {
                    d.opacity = d.maxOpacity * (yRatio / 0.08);
                } else {
                    d.opacity = d.maxOpacity;
                }

                if (d.y < -6) {
                    d.y = canvas.height + 6;
                    d.x = Math.random() * canvas.width;
                    d.maxOpacity = Math.random() * cfg.dust.maxOpacityRange + cfg.dust.maxOpacityBase;
                }
                if (d.x < 0) d.x = canvas.width;
                if (d.x > canvas.width) d.x = 0;

                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cfg.dust.rgb}, ${d.opacity})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [type]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};
