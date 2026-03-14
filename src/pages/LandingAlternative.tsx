import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { LegacyButton } from '@/components/LandingAlternate/LegacyButton';
import { HeroSlider } from '@/components/LandingAlternate/HeroSlider';
import { GoldParticles } from '@/components/LandingAlternate/GoldParticles';
import { OurFleet } from '@/components/LandingAlternate/OurFleet';
import { LegacyHeader } from '@/components/LandingAlternate/LegacyHeader';

interface LandingAlternativeProps {
    session: any;
    userRole: string;
    handleSignOut: () => void;
}

export const LandingAlternative = ({ session, userRole, handleSignOut }: LandingAlternativeProps) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<'comfort' | 'luxury' | null>(null);

    const handleSelect = (type: 'comfort' | 'luxury') => {
        // Updated to match current app routing logic
        // "regular" is the current app's equivalent of "comfort"
        const targetType = type === 'comfort' ? 'regular' : 'luxury';
        navigate(`/login?type=${targetType}`);
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col transition-colors duration-700 font-sans">
            <LegacyHeader session={session} userRole={userRole} handleSignOut={handleSignOut} />

            {/* Dynamic Background Layer (Applies to whole page or selection section) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    {hovered === 'comfort' && (
                        <motion.div
                            key="comfort-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-blue-900/40"
                        />
                    )}
                    {hovered === 'luxury' && (
                        <motion.div
                            key="luxury-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-black"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Section 1: Hero (Logo + Text + Slider) */}
            <div className="relative min-h-[60vh] py-20 md:py-0 flex flex-col items-center justify-center overflow-hidden z-10">
                <HeroSlider />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 text-center px-4"
                >
                    <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        src="https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/logos/G4-transparent-logo.png"
                        alt="G4 Logo"
                        className="w-16 md:w-32 mx-auto mb-8 drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                    />
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-3xl md:text-6xl font-bold tracking-tight text-white mb-2"
                    >
                        Choose Your <span className="text-[#D4AF37]">Experience</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-gray-300 text-lg max-w-xl mx-auto"
                    >
                        Redefining transportation with two distinct classes of service.
                    </motion.p>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 z-20"
                >
                    <span className="text-2xl">↓</span>
                </motion.div>

                {/* Smooth Gradient Transition */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Section 2: Taxi Type Selection */}
            <div className="flex-1 bg-black py-20 px-4 md:px-8 relative z-10">

                {/* Gold Particles moved here, strictly bottom section */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
                    <GoldParticles />
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
                    {/* Comfort Side - Restored Dynamic Hover */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        onHoverStart={() => setHovered('comfort')}
                        onHoverEnd={() => setHovered(null)}
                        whileHover={{ y: -10 }}
                        className="group relative bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-8 flex flex-col items-center overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 hover:bg-[#1a1a1a]"
                        onClick={() => handleSelect('comfort')}
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-all" />

                        <div className="mb-8 relative z-10 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors">STANDARD</h2>
                            <p className="text-gray-500 text-sm uppercase tracking-widest group-hover:text-blue-200/70">Reliable & Professional</p>
                        </div>

                        <div className="relative w-full h-40 mb-8 flex items-center justify-center z-10">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <img
                                src="https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/cars/corolla.png"
                                alt="Comfort Car"
                                className="w-full scale-110 object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                            />
                        </div>

                        <LegacyButton variant="outline" className="mt-auto border-gray-600 text-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white w-full max-w-xs transition-colors z-10">
                            Select Standard
                        </LegacyButton>
                    </motion.div>

                    {/* Luxury Side - Restored Dynamic Hover */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onHoverStart={() => setHovered('luxury')}
                        onHoverEnd={() => setHovered(null)}
                        whileHover={{ y: -10 }}
                        className="group relative bg-black/80 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl p-5 md:p-8 flex flex-col items-center overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                        onClick={() => handleSelect('luxury')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] opacity-50 group-hover:opacity-100" />

                        <div className="mb-8 relative z-10 text-center">
                            {/* Removed Badge as requested */}
                            <h2 className="text-3xl font-bold text-white mb-2 font-serif">LUXURY</h2>
                            <p className="text-[#D4AF37]/80 text-sm uppercase tracking-widest">Premium & Elite</p>
                        </div>

                        <div className="relative w-full h-40 mb-8 flex items-center justify-center z-10">
                            <div className="absolute inset-0 bg-[#D4AF37]/20 blur-[80px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                            <img
                                src="https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/cars/escalade.png"
                                alt="Luxury Car"
                                className="w-3/5 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <LegacyButton className="mt-auto bg-gradient-to-r from-[#D4AF37] to-[#B59122] text-black font-bold border-none hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] w-full max-w-xs transition-all duration-300 z-10">
                            Apply for Luxury
                        </LegacyButton>
                    </motion.div>
                </div>

                {/* Our Fleet Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-16 max-w-7xl mx-auto relative z-10"
                >
                    <OurFleet />
                </motion.div>
            </div>
        </div>
    );
};
