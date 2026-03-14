import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Car, Users, Copy, Check, User, Mail, LogOut, Loader2, BadgeCheck, Settings } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { useNavigate } from "react-router-dom";
import g4Logo from "@/assets/g4-logo.jpg";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";
import { toast } from "sonner";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ProfileDetailsModal } from "@/components/ProfileDetailsModal";

const UserProfile = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    authService.checkUserExists().then(({ role }) => {
      setIsAdmin(role === 'admin');
    });
  }, []);

  // We'll use infinite query for the dashboard to simulate pagination of the list
  // The 'profile' info will just be taken from the first page
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['userDashboardInfinite'],
    queryFn: ({ pageParam = 1 }) => dashboardService.getMyDashboard(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.referral_stats.current_page < lastPage.referral_stats.total_pages) {
        return lastPage.referral_stats.current_page + 1;
      }
      return undefined;
    }
  });

  const profile = data?.pages[0]?.profile;
  const application = data?.pages[0]?.application;
  const referralStats = data?.pages[0]?.referral_stats;

  // Flatten referrals
  const referralList = data?.pages.flatMap(page => page.referral_list) || [];

  const isLuxury = profile?.status?.toLowerCase().includes('luxury') || false;

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      const fullLink = `${window.location.origin}/?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isLuxury ? "bg-foreground" : "bg-background"}`}>
      <ParticlesBackground type={isLuxury ? "luxury" : "regular"} />
      <header className={`py-6 border-b ${isLuxury ? "border-muted-foreground/20 bg-foreground" : "border-border bg-background"} relative z-10`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 ${isLuxury ? "text-card hover:text-secondary" : "text-foreground hover:text-accent"} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <img src={g4Logo} alt="G4 Car Service" className="h-10" />
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className={`flex items-center gap-2 ${isLuxury ? "text-accent hover:text-accent/80" : "text-primary hover:text-primary/80"} transition-colors`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden md:inline">Admin Panel</span>
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    await authService.signOut();
                    toast.success("Signed out successfully");
                    navigate("/");
                  } catch (error) {
                    console.error(error);
                    toast.error("Error signing out");
                  }
                }}
                className={`flex items-center gap-2 ${isLuxury ? "text-card/80 hover:text-card" : "text-muted-foreground hover:text-red-500"} transition-colors`}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-4 mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${isLuxury ? "bg-accent" : "bg-secondary"}`}>
              {application?.profile_photo_url || profile?.avatar_url ? (
                <img
                  src={application?.profile_photo_url || profile?.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className={`w-10 h-10 ${isLuxury ? "text-accent-foreground" : "text-foreground"}`} />
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${isLuxury ? "text-card" : "text-foreground"}`}>
                {profile?.full_name || "Driver"}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isLuxury ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                  {isLuxury ? <Crown className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                  <span className="text-sm font-medium capitalize">{profile?.status || "Active"}</span>
                </div>
                {application && (
                  <Button
                    variant={isLuxury ? "secondary" : "default"}
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => setIsDetailsOpen(true)}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    View Full Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ProfileDetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            application={application}
          />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className={`p-6 ${isLuxury ? "bg-card/10 border-muted-foreground/20" : ""}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isLuxury ? "text-card" : "text-foreground"}`}>
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${isLuxury ? "text-muted" : "text-muted-foreground"}`} />
                  <span className={isLuxury ? "text-card" : "text-foreground"}>{profile?.email || ""}</span>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isLuxury ? "bg-accent/20 border-accent/30" : "bg-accent/10 border-accent/20"}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isLuxury ? "text-card" : "text-foreground"}`}>
                Your Unique Referral Link
              </h2>
              <div className="flex items-center gap-3">
                <div className={`flex-1 px-4 py-3 rounded-lg font-mono text-sm break-all ${isLuxury ? "bg-card/10 text-accent" : "bg-card text-accent"}`}>
                  {profile?.referral_code ? `${window.location.origin}/?ref=${profile.referral_code}` : "Loading..."}
                </div>
                <Button
                  onClick={copyReferralCode}
                  variant="outline"
                  className={`px-4 ${isLuxury ? "border-muted-foreground/30 text-card hover:bg-card/10" : ""}`}
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className={`text-sm mt-3 ${isLuxury ? "text-muted" : "text-muted-foreground"}`}>
                Share this link with friends and earn rewards when they sign up!
              </p>
            </Card>
          </div>

          <Card className={`p-6 mb-8 ${isLuxury ? "bg-card/10 border-muted-foreground/20" : ""}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${isLuxury ? "bg-accent/20" : "bg-accent/10"}`}>
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className={`text-3xl font-bold ${isLuxury ? "text-card" : "text-foreground"}`}>
                  {referralStats?.total_referred || 0}
                </p>
                <p className={`text-sm ${isLuxury ? "text-muted" : "text-muted-foreground"}`}>
                  People registered using your code
                </p>
              </div>
            </div>

            <h3 className={`font-semibold mb-4 ${isLuxury ? "text-card" : "text-foreground"}`}>
              Your Referrals
            </h3>
            <div className="space-y-3">
              {referralList.map((referral) => (
                <div
                  key={referral.email}
                  className={`flex items-center justify-between p-3 rounded-lg ${isLuxury ? "bg-card/5" : "bg-secondary/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLuxury ? "bg-card/20" : "bg-secondary"}`}>
                      <User className={`w-4 h-4 ${isLuxury ? "text-card" : "text-foreground"}`} />
                    </div>
                    <span className={isLuxury ? "text-card" : "text-foreground"}>{referral.full_name || referral.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                      <Car className="w-3 h-3" />
                      {referral.status}
                    </span>
                    <span className={`text-sm ${isLuxury ? "text-muted" : "text-muted-foreground"}`}>
                      {new Date(referral.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {referralList.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">No referrals yet.</p>
              )}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className={isLuxury ? "text-card border-card hover:bg-card/10" : ""}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Referrals"
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
