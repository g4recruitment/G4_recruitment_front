import { motion } from 'framer-motion';

// Sourced from public-resources/our-fleet
const FLEET_IMAGES = [
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.01.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.02.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.04.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(1).jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(2).jpeg"
];

// Double for seamless loop
const MARQUEE_ITEMS = [...FLEET_IMAGES, ...FLEET_IMAGES];

export const OurFleet = () => {
    return (
        // Updated container: rounded-3xl, full border, consistent with request
        <div className="w-full py-10 md:py-20 overflow-hidden relative border border-white/10 bg-neutral-900/30 backdrop-blur-sm rounded-3xl mx-auto my-8 max-w-[95%]">
            {/* Removed font-serif to match page typography */}
            <h3 className="text-3xl font-bold text-center text-[#D4AF37] mb-8 md:mb-16 uppercase tracking-widest">
                Our Exclusive Fleet
            </h3>

            {/* Gradient Masks - Updated to respect rounded corners */}
            <div className="absolute top-0 left-0 w-8 md:w-32 h-full bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none rounded-l-3xl" />
            <div className="absolute top-0 right-0 w-8 md:w-32 h-full bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none rounded-r-3xl" />

            <motion.div
                className="flex gap-10 w-max px-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: 35,
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                {MARQUEE_ITEMS.map((src, idx) => (
                    <div
                        key={idx}
                        // Reduced size to w-56 (14rem) and h-72 (18rem) on mobile, w-64/h-80 on md+
                        // Using standard rounded-2xl to ensure border radius works reliably
                        className="relative w-56 h-72 md:w-64 md:h-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shrink-0 group bg-neutral-900"
                    >
                        <img
                            src={src}
                            alt="G4 Fleet Vehicle"
                            className="w-full h-full object-cover transform transition-transform duration-700 opacity-90 group-hover:opacity-100 grayscale hover:grayscale-0 group-hover:scale-105"
                        />
                        {/* Border overlay matches the new rounded corners */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
