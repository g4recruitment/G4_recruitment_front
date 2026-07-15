import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '@/lib/assets';

const STOCK_IMAGES = [
    ASSETS.heroDriverPov, // Driver POV
];

export const HeroSlider = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % STOCK_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={index}
                    src={STOCK_IMAGES[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Background"
                />
            </AnimatePresence>
            {/* Gray/Dark Overlay */}
            <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>
    );
};
