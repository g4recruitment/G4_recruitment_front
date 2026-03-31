import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Car, Crown, CheckCircle, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { LandingAlternative } from "@/pages/LandingAlternative";
import { supabase } from "@/lib/supabase";
import regularSedan from "@/assets/regular-sedan.jpg";
import luxuryEscalade from "@/assets/luxury-escalade.jpg";
import g4Logo from "@/assets/g4-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("guest");
  const [loading, setLoading] = useState(true);
  const [bgType, setBgType] = useState<"regular" | "luxury">("regular");
  const [showAlternate, setShowAlternate] = useState(false);

  useEffect(() => {
    // 1. Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      console.log("🔗 Referral Code Detected:", refCode);
      localStorage.setItem("pending_referral", refCode);

      // Clear URL to look clean
      window.history.replaceState({}, document.title, window.location.pathname);

      toast.success(`🔗 Referral code ${refCode} detected!`, {
        description: "Please login to apply.",
      });
    }

    // 2. Manage session & Check Role
    const checkSessionAndRole = async (currentSession: any) => {
      if (!currentSession) {
        setSession(null);
        setUserRole("guest");
        setLoading(false);
        return;
      }

      setSession(currentSession);
      // Check user role
      try {
        const { role } = await authService.checkUserExists();
        console.log("👤 User Role:", role);
        setUserRole(role || "driver");
      } catch (err) {
        console.error("Error fetching role:", err);
        // Fallback to basic user if check fails but session exists
        setUserRole("driver");
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndRole(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSessionAndRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error(error);
      // Even if server fails, we sign out locally so user isn't stuck
    } finally {
      setSession(null);
      setUserRole("guest");
      localStorage.removeItem("pending_referral");
      localStorage.removeItem("pendingDriverType");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Design Switcher - Fixed Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl animate-in slide-in-from-bottom-4 duration-700">
        <span className={`text-xs font-bold uppercase tracking-wider ${showAlternate ? "text-white" : "text-gray-900"}`}>
          {showAlternate ? "Luxury Mode" : "Standard Mode"}
        </span>
        <Switch
          checked={showAlternate}
          onCheckedChange={setShowAlternate}
          className="data-[state=checked]:bg-[#D4AF37]"
        />
      </div>

      {showAlternate ? (
        <LandingAlternative session={session} userRole={userRole} handleSignOut={handleSignOut} />
      ) : (
        <>
          <ParticlesBackground type={bgType} />

          {/* Header */}
          <header className="py-6 border-b border-border relative z-10 bg-background">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                  <img src={g4Logo} alt="G4 Car Service" className="h-10" />
                  <span className="text-xl font-bold tracking-tight hidden sm:block">
                    G4 <span className="text-primary font-light">Recruit</span>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {loading ? (
                    <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                  ) : !session ? (
                    // GUEST View
                    <Button
                      onClick={() => navigate("/login")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <span className="flex items-center gap-2">
                        Sign In <User className="w-4 h-4" />
                      </span>
                    </Button>
                  ) : (
                    // AUTHENTICATED View
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span className="hidden md:inline">My Profile</span>
                      </Button>

                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-2 text-primary"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden md:inline">Admin Panel</span>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Sign Out</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-12 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Join Our Driver Team
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose your preferred driving experience and start earning with G4 Car Service.
                Select the option that best fits your style.
              </p>
            </div>

            {/* Driver Type Selection */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Regular Driver Card */}
              <Card
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-success group relative z-10"
                onClick={() => navigate("/login?type=regular")}
                onMouseEnter={() => setBgType("regular")}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={regularSedan}
                    alt="Regular sedan for standard driving"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-card">
                      <Car className="w-6 h-6" />
                      <span className="text-xl font-bold">Standard Driver</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Standard Service
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drive your own sedan and provide reliable transportation services
                    to everyday passengers. Flexible hours, steady income.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["Use your own vehicle", "Flexible schedule", "Competitive earnings", "Full support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-foreground">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                    Apply as Regular Driver
                  </Button>
                </div>
              </Card>

              {/* Luxury Driver Card */}
              <Card
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-success group bg-foreground relative z-10"
                onClick={() => navigate("/login?type=luxury")}
                onMouseEnter={() => setBgType("luxury")}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={luxuryEscalade}
                    alt="Luxury Escalade with professional driver"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-card">
                      <Crown className="w-6 h-6" />
                      <span className="text-xl font-bold">Luxury Driver</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-card mb-3">
                    Premium Experience
                  </h3>
                  <p className="text-muted mb-4">
                    Provide executive transportation in luxury vehicles. Professional
                    attire required. Higher earnings, premium clients.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["Premium fleet", "Executive Clients", "Higher earnings", "Professional training"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-card">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Apply as Luxury Driver
                  </Button>
                </div>
              </Card>
            </div>

            {/* Footer Info */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                Questions? Contact us at{" "}
                <a href="mailto:drivers@g4car.services" className="text-accent hover:underline">
                  drivers@g4car.services
                </a>
              </p>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default Index;
