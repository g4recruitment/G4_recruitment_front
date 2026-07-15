import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ASSETS } from '@/lib/assets';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LegacyHeaderProps {
    session: any;
    userRole: string;
    handleSignOut: () => void;
    loading?: boolean;
}

export const LegacyHeader = ({ session, userRole, handleSignOut, loading }: LegacyHeaderProps) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 md:h-16">

                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src={ASSETS.logoGold}
                            alt="G4 Fleet"
                            className="h-7 md:h-9 w-auto object-contain"
                        />
                    </div>

                    {/* Auth actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {loading ? (
                            /* Skeleton while session resolves */
                            <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" />
                        ) : !session ? (
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-[#D4AF37] hover:bg-[#c9a42e] text-black font-semibold border-none rounded-full h-9 px-5 text-sm"
                            >
                                Sign In
                                <User className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden md:flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/profile')}
                                        className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 text-sm"
                                    >
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </Button>

                                    {userRole === 'admin' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/admin')}
                                            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-white/5 text-sm"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Admin
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/5 text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </Button>
                                </div>

                                {/* Mobile dropdown */}
                                <div className="md:hidden">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:bg-white/10 h-9 w-9"
                                            >
                                                <Menu className="w-5 h-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-52 bg-zinc-900 border-zinc-800 text-gray-100 mt-1"
                                        >
                                            <DropdownMenuLabel className="text-gray-400 text-xs font-normal">
                                                My Account
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => navigate('/profile')}
                                                className="cursor-pointer hover:bg-white/5 focus:bg-white/10 gap-2"
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                My Profile
                                            </DropdownMenuItem>
                                            {userRole === 'admin' && (
                                                <DropdownMenuItem
                                                    onClick={() => navigate('/admin')}
                                                    className="cursor-pointer text-[#D4AF37] hover:bg-white/5 focus:bg-white/10 gap-2"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Admin Panel
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={handleSignOut}
                                                className="cursor-pointer text-red-400 hover:bg-white/5 focus:bg-white/10 gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
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
