import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Crown, Car, TrendingUp, LogOut,
  Loader2, Search, ArrowLeft, ChevronRight, LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { adminService, GetUsersParams, DashboardStats } from "@/services/admin.service";
import { toast } from "sonner";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ProfileDetailsModal } from "@/components/ProfileDetailsModal";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { Footer } from "@/components/LandingAlternate/Footer";
import { ASSETS } from "@/lib/assets";

const GOLD = "#D4AF37";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function GoldDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/35 to-transparent" />
  );
}

function StatCard({
  icon: Icon, label, value, loading, delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  loading: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-white/[0.07] overflow-hidden p-5"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(212,175,55,0.1)" }}
      >
        <Icon className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
      </div>

      {loading ? (
        <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse mb-1.5" />
      ) : (
        <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
      )}
      <p className="text-[11px] uppercase tracking-widest text-gray-600 font-medium">{label}</p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    rejected: "text-red-400 bg-red-400/10 border-red-400/25",
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
  };
  const key = (status || "pending").toLowerCase();
  const cls = styles[key] ?? styles.pending;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${cls}`}>
      {status || "Pending"}
    </span>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminService.getStats,
  });

  const { data: usersData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: usersLoading } =
    useInfiniteQuery({
      queryKey: ["adminUsers", searchTerm, categoryFilter],
      queryFn: ({ pageParam = 1 }) => {
        const params: GetUsersParams = {
          page: pageParam,
          limit: 10,
          search: searchTerm,
          category: categoryFilter === "all" ? undefined : categoryFilter,
        };
        return adminService.getUsers(params);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.current_page < lastPage.meta.total_pages
          ? lastPage.meta.current_page + 1
          : undefined,
    });

  const { data: userDetail } = useQuery({
    queryKey: ["adminUserDetail", selectedUserId],
    queryFn: () => adminService.getUserDetail(selectedUserId!),
    enabled: !!selectedUserId && isDetailsOpen,
  });

  const usersList = usersData?.pages.flatMap((p) => p.data) ?? [];
  const statsData = (stats as { stats?: DashboardStats } | undefined)?.stats || stats;
  const totalUsers    = statsData?.total_users    ?? 0;
  const regularDrivers = statsData?.total_comfort ?? 0;
  const luxuryDrivers  = statsData?.total_luxury  ?? 0;
  const totalReferrals = statsData?.total_referrals ?? 0;

  const categoryLabels: Record<string, string> = {
    all: "All",
    comfort: "Regular",
    luxury: "Luxury",
  };

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      <ParticlesBackground type="luxury" />

      <ProfileDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={userDetail?.application || { id: selectedUserId, status: "loading..." }}
        referrals={userDetail?.referrals}
      />

      <div className="relative z-10 flex flex-col min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: "rgba(5,5,5,0.92)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/8 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <img
              src={ASSETS.logoGold}
              alt="G4 Fleet"
              className="h-7 md:h-8 w-auto object-contain"
            />

            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-600 font-medium">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/profile")}
              className="hidden md:flex items-center gap-2 text-gray-500 hover:text-white hover:bg-white/5 text-sm px-3 py-1.5 rounded-lg transition-all"
            >
              <Users className="w-4 h-4" />
              My Profile
            </button>
            <button
              onClick={async () => {
                try {
                  await authService.signOut();
                  toast.success("Signed out");
                  navigate("/");
                } catch {
                  toast.error("Error signing out");
                }
              }}
              className="flex items-center gap-2 text-red-500/80 hover:text-red-400 hover:bg-red-400/8 text-sm px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">

        {/* ── Page heading ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(212,175,55,0.1)" }}
          >
            <LayoutDashboard className="w-5 h-5" style={{ color: GOLD }} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Control Panel
            </h1>
            <p className="text-xs text-gray-600">Monitor applications and manage drivers.</p>
          </div>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatCard icon={Users}      label="Total Drivers" value={totalUsers}      loading={statsLoading} delay={0} />
          <StatCard icon={Car}        label="Regular"        value={regularDrivers}  loading={statsLoading} delay={0.07} />
          <StatCard icon={Crown}      label="Luxury"         value={luxuryDrivers}   loading={statsLoading} delay={0.14} />
          <StatCard icon={TrendingUp} label="Referrals"      value={totalReferrals}  loading={statsLoading} delay={0.21} />
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">

          {/* Search input */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-700 rounded-xl border border-white/[0.07] outline-none transition-colors focus:border-[#D4AF37]/40"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>

          {/* Category filter pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            {(["all", "comfort", "luxury"] as const).map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={
                    active
                      ? { background: GOLD, color: "#000", fontWeight: 600 }
                      : { color: "#6b7280" }
                  }
                >
                  {categoryLabels[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Drivers table ──────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <GoldDivider />

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_72px_104px] gap-4 px-5 py-3 border-b border-white/[0.05]">
            {["Driver", "Status", "Category", "Refs", "Registered"].map((h, i) => (
              <p
                key={h}
                className={`text-[11px] uppercase tracking-[0.18em] font-medium text-gray-700 ${i === 4 ? "text-right" : ""}`}
              >
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {usersLoading && usersList.length === 0 ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-white/[0.04] rounded" />
                    <div className="h-2.5 w-44 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))
            ) : usersList.length > 0 ? (
              usersList.map((user, i) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.25) }}
                  onClick={() => { setSelectedUserId(user.id); setIsDetailsOpen(true); }}
                  className="w-full text-left group hover:bg-white/[0.03] transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_72px_104px] gap-2 md:gap-4 px-5 py-4">

                    {/* Avatar + name/email */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-black"
                        style={{ background: GOLD }}
                      >
                        {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <StatusBadge status={user.driver_status} />
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-1.5">
                      {user.driver_category?.toLowerCase() === "luxury" ? (
                        <Crown className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} strokeWidth={1.5} />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-gray-600 shrink-0" strokeWidth={1.5} />
                      )}
                      <span className="text-sm text-gray-400 capitalize">
                        {user.driver_category === "luxury" ? "Luxury" : "Regular"}
                      </span>
                    </div>

                    {/* Referrals */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 font-mono tabular-nums">
                        {user.referred_count}
                      </span>
                    </div>

                    {/* Date + chevron */}
                    <div className="hidden md:flex items-center justify-end gap-2">
                      <span className="text-xs text-gray-700">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "2-digit",
                            })
                          : "N/A"}
                      </span>
                      <ChevronRight
                        className="w-3.5 h-3.5 text-gray-800 group-hover:text-[#D4AF37] transition-colors shrink-0"
                      />
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-5 py-16 text-center">
                <Search className="w-7 h-7 text-gray-800 mx-auto mb-3" strokeWidth={1} />
                <p className="text-gray-600 text-sm">No drivers match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Load more ──────────────────────────────────────────────────── */}
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-medium transition-all disabled:opacity-40 hover:bg-[#D4AF37]/8"
              style={{ borderColor: `${GOLD}40`, color: GOLD }}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more drivers"
              )}
            </button>
          </div>
        )}
      </main>

      <Footer hideDriverLinks />

      </div>
    </div>
  );
};

export default AdminDashboard;
