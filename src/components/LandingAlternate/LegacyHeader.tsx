import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LegacyHeaderProps {
    session: any;
    userRole: string;
    handleSignOut: () => void;
}

export const LegacyHeader = ({ session, userRole, handleSignOut }: LegacyHeaderProps) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 font-sans transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 md:h-16">
                    {/* Logo (Gold Brand) */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <img
                            src="https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/logos/G4_GOLD_brand.webp"
                            alt="G4 Fleet"
                            className="h-8 md:h-9 w-auto object-contain"
                        />
                    </div>

                    {/* Auth Actions (Adapted Styles) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {!session ? (
                            <Button
                                onClick={() => navigate("/login")}
                                className="bg-[#D4AF37] hover:bg-[#B59122] text-black font-semibold border-none rounded-full"
                            >
                                <span className="flex items-center gap-2">
                                    Sign In <User className="w-4 h-4" />
                                </span>
                            </Button>
                        ) : (
                            <>
                                {/* Desktop View */}
                                <div className="hidden md:flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate("/profile")}
                                        className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] hover:bg-white/5"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My Profile</span>
                                    </Button>

                                    {userRole === 'admin' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate("/admin")}
                                            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-white/5"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Admin</span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/5"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </Button>
                                </div>

                                {/* Mobile View (Dropdown) */}
                                <div className="md:hidden">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                                <Menu className="w-6 h-6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-gray-100">
                                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-white/5 focus:bg-white/10">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>My Profile</span>
                                            </DropdownMenuItem>
                                            {userRole === 'admin' && (
                                                <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-[#D4AF37] hover:bg-white/5 focus:bg-white/10">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Admin Panel</span>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 hover:bg-white/5 focus:bg-white/10">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Sign Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
