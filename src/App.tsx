import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// Eager: landing + auth entry points (needed on first paint / cold visits).
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

// Lazy: heavy authenticated flows and rarely-hit legal pages are split out of
// the initial bundle (RegisterDriver alone is ~1.6k lines + framer-motion;
// AdminDashboard pulls in recharts).
const RegisterDriver = lazy(() => import("./pages/RegisterDriver"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DriverAgreement = lazy(() => import("./pages/DriverAgreement"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 min — avoids refetch storms on remount
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const RouteFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <Suspense fallback={<RouteFallback />}>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route
                                path="/register/regular"
                                element={
                                    <ProtectedRoute>
                                        <RegisterDriver type="regular" />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/register/luxury"
                                element={
                                    <ProtectedRoute>
                                        <RegisterDriver type="luxury" />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <UserProfile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route path="/driver-agreement" element={<DriverAgreement />} />
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
