import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ASSETS } from '@/lib/assets';

import { LegacyButton } from '@/components/LandingAlternate/LegacyButton';
import { HeroSlider } from '@/components/LandingAlternate/HeroSlider';
import { GoldParticles } from '@/components/LandingAlternate/GoldParticles';
import { OurFleet } from '@/components/LandingAlternate/OurFleet';
import { LegacyHeader } from '@/components/LandingAlternate/LegacyHeader';
import { Footer } from '@/components/LandingAlternate/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('guest');
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<'comfort' | 'luxury' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('pending_referral', refCode);
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success(`Referral code ${refCode} detected!`, {
        description: 'Please login to apply.',
      });
    }

    const checkSessionAndRole = async (currentSession: any) => {
      if (!currentSession) {
        setSession(null);
        setUserRole('guest');
        setLoading(false);
        return;
      }
      setSession(currentSession);
      try {
        const { role } = await authService.checkUserExists();
        setUserRole(role || 'driver');
      } catch {
        setUserRole('driver');
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndRole(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSessionAndRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setSession(null);
      setUserRole('guest');
      localStorage.removeItem('pending_referral');
      localStorage.removeItem('pendingDriverType');
      navigate('/');
    }
  };

  const handleSelect = (type: 'comfort' | 'luxury') => {
    const targetType = type === 'comfort' ? 'regular' : 'luxury';
    navigate(`/login?type=${targetType}`);
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans overflow-x-hidden">
      <LegacyHeader
        session={session}
        userRole={userRole}
        handleSignOut={handleSignOut}
        loading={loading}
      />

      {/* Dynamic background layer — desktop hover only */}
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

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <div className="relative min-h-[65vh] md:min-h-[60vh] flex flex-col items-center justify-center overflow-hidden z-10">
        <HeroSlider />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-6 pt-16 md:pt-0"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            src={ASSETS.logoTransparent}
            alt="G4 Logo"
            className="w-14 md:w-28 mx-auto mb-5 md:mb-8 drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-3"
          >
            Choose Your <span className="text-[#D4AF37]">Experience</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 text-sm md:text-lg max-w-sm md:max-w-xl mx-auto leading-relaxed"
          >
            Redefining transportation with two distinct classes of service.
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 z-20"
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1.5" />
            <motion.rect
              x="8.5" y="5" width="3" height="6" rx="1.5" fill="currentColor"
              animate={{ y: [0, 6, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
          </svg>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-32 md:h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
      </div>

      {/* ─── Driver Type Selection ────────────────────────────────── */}
      <div className="flex-1 bg-black py-10 md:py-20 px-4 md:px-8 relative z-10">

        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <GoldParticles />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4 md:gap-8 relative z-10">

          {/* ── Luxury ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            onHoverStart={() => setHovered('luxury')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -8 }}
            className="group relative bg-black/80 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl p-5 md:p-8 flex flex-col items-center overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_50px_rgba(212,175,55,0.2)]"
            onClick={() => handleSelect('luxury')}
          >
            {/* Gold top line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Title */}
            <div className="mb-4 md:mb-7 relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 font-serif tracking-wide">
                LUXURY
              </h2>
              <p className="text-[#D4AF37]/70 text-[10px] md:text-xs uppercase tracking-[0.2em]">
                Premium & Elite
              </p>
            </div>

            {/* Car image */}
            <div className="relative w-full h-32 md:h-44 mb-5 md:mb-8 flex items-center justify-center z-10">
              <div className="absolute inset-0 bg-[#D4AF37]/15 blur-[50px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
              <img
                src={ASSETS.carEscalade}
                alt="Luxury Escalade 2026"
                className="max-h-full w-auto mx-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <LegacyButton className="mt-auto bg-gradient-to-r from-[#D4AF37] to-[#B59122] text-black font-bold border-none hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] w-full max-w-[280px] transition-all duration-300 z-10 text-sm md:text-base">
              Apply for Luxury
            </LegacyButton>
          </motion.div>

          {/* ── Standard ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            onHoverStart={() => setHovered('comfort')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -8 }}
            className="group relative bg-[#111]/80 backdrop-blur-sm border border-white/8 rounded-2xl p-5 md:p-8 flex flex-col items-center overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 hover:bg-[#1a1a1a] hover:border-white/15"
            onClick={() => handleSelect('comfort')}
          >
            {/* Blue top line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            {/* Title */}
            <div className="mb-4 md:mb-7 relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-wide group-hover:text-blue-50 transition-colors duration-300">
                STANDARD
              </h2>
              <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:text-blue-300/60 transition-colors duration-300">
                Reliable & Professional
              </p>
            </div>

            {/* Car image */}
            <div className="relative w-full h-32 md:h-44 mb-5 md:mb-8 flex items-center justify-center z-10">
              <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={ASSETS.carCorolla}
                alt="Standard Sedan"
                className="max-h-full w-auto mx-auto object-contain opacity-85 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
              />
            </div>

            <LegacyButton variant="outline" className="mt-auto border-white/20 text-gray-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white w-full max-w-[280px] transition-all duration-300 z-10 text-sm md:text-base">
              Select Standard
            </LegacyButton>
          </motion.div>
        </div>

        {/* Our Fleet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-10 md:mt-16 max-w-7xl mx-auto relative z-10"
        >
          <OurFleet />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
