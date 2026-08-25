import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/LandingAlternate/Footer';
import { motion } from 'framer-motion';
import { ASSETS } from '@/lib/assets';

interface Section {
    title: string;
    content: React.ReactNode;
}

interface LegalLayoutProps {
    title: string;
    subtitle: string;
    effectiveDate: string;
    sections: Section[];
}

export const LegalLayout = ({ title, subtitle, effectiveDate, sections }: LegalLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <img
                            src={ASSETS.logoGold}
                            alt="G4 Car Services"
                            className="h-7 md:h-9 w-auto object-contain cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-28 md:pt-36 pb-12 px-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
                <div className="h-[1px] w-48 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mb-8" />
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3"
                >
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-gray-400 text-sm md:text-base mb-2"
                >
                    {subtitle}
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[#D4AF37]/60 text-xs"
                >
                    Effective date: {effectiveDate}
                </motion.p>
                <div className="h-[1px] w-48 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mt-8" />
            </section>

            {/* Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-20 space-y-8">
                {sections.map((section, i) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="relative rounded-2xl bg-black/60 border border-white/8 p-6 md:p-8 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                        <h2 className="text-base font-semibold text-[#D4AF37] uppercase tracking-[0.12em] mb-4">
                            {section.title}
                        </h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-3">
                            {section.content}
                        </div>
                    </motion.div>
                ))}

                <p className="text-center text-gray-600 text-xs pt-4">
                    Questions? Contact us at{' '}
                    <a href="mailto:info@g4car.services" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
                        info@g4car.services
                    </a>
                </p>
            </main>

            <Footer hideDriverLinks />
        </div>
    );
};
