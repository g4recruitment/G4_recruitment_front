import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Car, Users, Copy, Check, Loader2, BadgeCheck, Link2, Mail, Hash } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { LegacyHeader } from "@/components/LandingAlternate/LegacyHeader";
import { Footer } from "@/components/LandingAlternate/Footer";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";
import { toast } from "sonner";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProfileDetailsModal } from "@/components/ProfileDetailsModal";

const GOLD = "#D4AF37";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

function getInitials(name?: string) {
  if (!name) return "DV";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/* Reusable card shell matching the landing's card style */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl bg-black/80 backdrop-blur-sm border border-[#D4AF37]/25 overflow-hidden ${className}`}>
      {/* Gold gradient top line */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />
      {children}
    </div>
  );
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    authService.checkUserExists().then(({ role }) => setIsAdmin(role === "admin"));
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["userDashboardInfinite"],
      queryFn: ({ pageParam = 1 }) => dashboardService.getMyDashboard(pageParam as number, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.referral_stats.current_page < lastPage.referral_stats.total_pages)
          return lastPage.referral_stats.current_page + 1;
        return undefined;
      },
    });

  const profile = data?.pages[0]?.profile;
  const application = data?.pages[0]?.application;
  const referralStats = data?.pages[0]?.referral_stats;
  const referralList = data?.pages.flatMap((p) => p.referral_list) ?? [];

  const isLuxury = application?.driver_category?.toLowerCase() === "luxury";

  const copyReferralCode = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCodeOnly = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopiedCode(true);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/?ref=${profile.referral_code}`
    : "";

  const appStatus = application ? "Submitted" : "—";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <ParticlesBackground type="luxury" />

      <LegacyHeader
        session={true}
        userRole={isAdmin ? "admin" : "driver"}
        handleSignOut={async () => {
          try {
            await authService.signOut();
            toast.success("Signed out");
            navigate("/");
          } catch {
            toast.error("Error signing out");
          }
        }}
        loading={false}
      />

      {/* Profile hero — pt-14/pt-16 offsets fixed header */}
      <section className="relative z-10 pt-28 md:pt-32 pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row sm:items-end gap-7 sm:gap-8"
          >
            {/* Avatar */}
            <motion.div variants={fadeUp} className="relative shrink-0 self-start sm:self-auto">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#D4AF37]/50"
                style={{ boxShadow: `0 0 28px rgba(212,175,55,0.35), 0 0 60px rgba(212,175,55,0.12)` }}
              >
                {application?.profile_photo_url || profile?.avatar_url ? (
                  <img
                    src={application?.profile_photo_url || profile?.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-[#D4AF37]/70">
                    {getInitials(profile?.full_name)}
                  </span>
                )}
              </div>

              {/* Crown badge */}
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border border-[#D4AF37]/40"
                style={{ background: "linear-gradient(135deg, #D4AF37, #B59122)" }}
              >
                {isLuxury
                  ? <Crown className="w-4 h-4 text-black" />
                  : <Car className="w-4 h-4 text-black" />
                }
              </div>
            </motion.div>

            {/* Identity */}
            <motion.div variants={fadeUp} className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: GOLD }}>
                {isLuxury ? "Luxury Driver" : "Standard Driver"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-white">
                {profile?.full_name || "Driver"}
              </h1>
              <p className="mt-2.5 text-sm text-gray-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                {profile?.email}
              </p>
            </motion.div>

            {/* Action */}
            {application && (
              <motion.div variants={fadeUp} className="shrink-0">
                <button
                  onClick={() => setIsDetailsOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #B59122)` }}
                >
                  <BadgeCheck className="w-4 h-4" />
                  My Documents
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid grid-cols-3 rounded-2xl overflow-hidden border border-[#D4AF37]/20 divide-x divide-[#D4AF37]/15"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
          >
            {[
              { value: referralStats?.total_referred ?? 0, label: "Referrals", Icon: Users },
              { value: isLuxury ? "Luxury" : "Standard", label: "Tier", Icon: isLuxury ? Crown : Car },
              { value: appStatus, label: "Status", Icon: BadgeCheck },
            ].map(({ value, label, Icon }) => (
              <div key={label} className="flex flex-col gap-1 px-3 md:px-5 py-4 md:py-5 min-w-0">
                <Icon className="w-3.5 h-3.5 mb-1 shrink-0" style={{ color: GOLD }} strokeWidth={1.5} />
                <span className="text-lg md:text-3xl font-bold tracking-tight text-white leading-tight truncate">
                  {value}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 truncate">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 relative z-10 max-w-5xl w-full mx-auto px-6 pb-16 space-y-5">

        {/* Referral link */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
                  <h2 className="font-semibold text-white">Your Referral Link</h2>
                </div>
                <p className="text-sm text-gray-500">Share with friends and earn when they sign up</p>
              </div>

              <button
                onClick={copyReferralCode}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-white/5"
                style={{ borderColor: "rgba(212,175,55,0.35)", color: copied ? "#4ade80" : GOLD }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div
              className="px-4 py-3 rounded-xl font-mono text-sm break-all select-all border"
              style={{
                background: "rgba(0,0,0,0.5)",
                borderColor: "rgba(212,175,55,0.2)",
                color: GOLD,
              }}
            >
              {referralLink || "Loading..."}
            </div>

            {/* Divider */}
            <div className="my-4 h-px w-full bg-[#D4AF37]/10" />

            {/* Code only */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} strokeWidth={1.5} />
                <span className="text-xs text-gray-500 shrink-0">Referral code</span>
                <span
                  className="ml-2 px-3 py-1 rounded-lg font-mono text-sm font-semibold tracking-widest border select-all truncate"
                  style={{
                    background: "rgba(212,175,55,0.06)",
                    borderColor: "rgba(212,175,55,0.2)",
                    color: GOLD,
                  }}
                >
                  {profile?.referral_code || "—"}
                </span>
              </div>
              <button
                onClick={copyCodeOnly}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 hover:bg-white/5"
                style={{ borderColor: "rgba(212,175,55,0.25)", color: copiedCode ? "#4ade80" : "rgba(212,175,55,0.7)" }}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied" : "Copy code"}
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
              <h2 className="font-semibold text-white">Referrals</h2>
              <span className="ml-auto text-2xl font-bold tracking-tight" style={{ color: GOLD }}>
                {referralStats?.total_referred ?? 0}
              </span>
            </div>

            {referralList.length > 0 ? (
              <div className="space-y-1">
                {referralList.map((referral) => {
                  const refInitials = getInitials(referral.full_name);
                  return (
                    <div
                      key={referral.email}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden border border-[#D4AF37]/20"
                        style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.6)" }}
                      >
                        {referral.avatar_url ? (
                          <img src={referral.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          refInitials
                        )}
                      </div>

                      <span className="flex-1 text-sm font-medium text-white truncate">
                        {referral.full_name || referral.email}
                      </span>

                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full capitalize shrink-0 border"
                        style={{
                          background: "rgba(212,175,55,0.08)",
                          borderColor: "rgba(212,175,55,0.2)",
                          color: "rgba(212,175,55,0.7)",
                        }}
                      >
                        {referral.status}
                      </span>

                      <span className="text-xs text-gray-600 shrink-0 hidden sm:block tabular-nums">
                        {new Date(referral.joined_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-600">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-20" strokeWidth={1} />
                <p className="text-sm">No referrals yet.</p>
                <p className="text-xs mt-1 opacity-60">Share your link to get started.</p>
              </div>
            )}

            {hasNextPage && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
                </button>
              </div>
            )}
          </Card>
        </motion.div>
      </main>

      <Footer hideDriverLinks />

      <ProfileDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={application}
      />
    </div>
  );
};

export default UserProfile;
