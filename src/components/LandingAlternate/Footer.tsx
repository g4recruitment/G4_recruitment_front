import { useNavigate } from 'react-router-dom';
import { Mail, Instagram, Phone, Globe } from 'lucide-react';
import { ASSETS } from '@/lib/assets';

const LINKS_DRIVERS = [
    { label: 'Apply as Luxury Driver', href: '/login?type=luxury' },
    { label: 'Apply as Standard Driver', href: '/login?type=regular' },
    { label: 'Sign In', href: '/login' },
    { label: 'My Profile', href: '/profile' },
];

const LINKS_LEGAL = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Driver Agreement', href: '/driver-agreement' },
];

interface FooterProps {
    hideDriverLinks?: boolean;
}

export const Footer = ({ hideDriverLinks = false }: FooterProps) => {
    const navigate = useNavigate();

    return (
        <footer className="relative z-10 bg-zinc-950 border-t border-[#D4AF37]/20">

            {/* Gold accent line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-8">

                {/* Main grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-8 mb-12 ${hideDriverLinks ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>

                    {/* Brand */}
                    <div className={hideDriverLinks ? '' : 'sm:col-span-2 lg:col-span-1'}>
                        <img
                            src={ASSETS.logoGold}
                            alt="G4 Car Services"
                            className="h-8 w-auto object-contain mb-4"
                        />
                        <p className="text-gray-400 text-sm leading-relaxed max-w-[220px]">
                            Premium transportation services with a fleet of luxury and standard vehicles across the region.
                        </p>
                        {/* Social */}
                        <div className="flex items-center gap-3 mt-5">
                            <a
                                href="https://www.instagram.com/g4car.services?igsh=bnZqY2FreHYxa3Y0"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300"
                            >
                                <Instagram className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://g4car.services"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="G4 Car Services website"
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300"
                            >
                                <Globe className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* For Drivers */}
                    {!hideDriverLinks && (
                        <div>
                            <h4 className="text-white text-xs uppercase tracking-[0.18em] font-semibold mb-5">
                                For Drivers
                            </h4>
                            <ul className="space-y-3">
                                {LINKS_DRIVERS.map(({ label, href }) => (
                                    <li key={label}>
                                        <button
                                            onClick={() => navigate(href)}
                                            className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors duration-200 text-left"
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Legal */}
                    <div>
                        <h4 className="text-white text-xs uppercase tracking-[0.18em] font-semibold mb-5">
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            {LINKS_LEGAL.map(({ label, href }) => (
                                <li key={label}>
                                    <button
                                        onClick={() => navigate(href)}
                                        className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors duration-200 text-left"
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white text-xs uppercase tracking-[0.18em] font-semibold mb-5">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:recruitment.g4@gmail.com"
                                    className="flex items-center gap-2 text-gray-500 hover:text-[#D4AF37] text-sm transition-colors duration-200 group"
                                >
                                    <Mail className="w-3.5 h-3.5 shrink-0 group-hover:text-[#D4AF37] transition-colors" />
                                    recruitment.g4@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+19176627368"
                                    className="flex items-center gap-2 text-gray-500 hover:text-[#D4AF37] text-sm transition-colors duration-200 group"
                                >
                                    <Phone className="w-3.5 h-3.5 shrink-0 group-hover:text-[#D4AF37] transition-colors" />
                                    +1 (917) 662-7368
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-600 text-xs">
                        &copy; {new Date().getFullYear()} G4 Car Services LLC. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-xs">
                        Developed by{' '}
                        <span className="text-[#D4AF37]/70 font-medium">
                            Stoic Development
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
};
