import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Crown, Car, TrendingUp, LogOut, Loader2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import g4Logo from "@/assets/g4-logo.jpg";
import { authService } from "@/services/auth.service";
import { adminService, GetUsersParams } from "@/services/admin.service";
import { toast } from "sonner";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ProfileDetailsModal } from "@/components/ProfileDetailsModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Stats Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats
  });

  // Users Infinite Query
  const {
    data: usersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: usersLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['adminUsers', searchTerm, categoryFilter],
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
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.total_pages) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });

  // Valid selected user detail query
  const { data: userDetail } = useQuery({
    queryKey: ['adminUserDetail', selectedUserId],
    queryFn: () => adminService.getUserDetail(selectedUserId!),
    enabled: !!selectedUserId && isDetailsOpen,
  });

  // Flatten users from all pages
  const usersList = usersData?.pages.flatMap(page => page.data) || [];

  // Robust stats extraction (handle both camelCase and snake_case)
  const statsData = (stats as any)?.stats || stats;
  const totalUsers = statsData?.total_users ?? statsData?.totalUsers ?? 0;
  const regularDrivers = statsData?.total_comfort ?? statsData?.regularDrivers ?? 0;
  const luxuryDrivers = statsData?.total_luxury ?? statsData?.luxuryDrivers ?? 0;
  const totalReferrals = statsData?.total_referrals ?? statsData?.totalReferrals ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={userDetail?.application || { id: selectedUserId, status: 'loading...' }}
        referrals={userDetail?.referrals}
      />

      {/* Header */}
      <header className="py-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={g4Logo} alt="G4 Car Service" className="h-8 md:h-10" />
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">My Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
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
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform performance and manage driver applications.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : regularDrivers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Luxury</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : luxuryDrivers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Referrals</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : totalReferrals}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="comfort">Regular (Comfort)</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Driver Name</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Referrals</th>
                  <th className="px-6 py-4 font-semibold text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading && usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                      <span className="text-muted-foreground">Loading drivers...</span>
                    </td>
                  </tr>
                ) : usersList.length > 0 ? (
                  usersList.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                      className="bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{user.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.driver_status?.toLowerCase() === 'approved' ? 'default' :
                              user.driver_status?.toLowerCase() === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="capitalize shadow-none"
                        >
                          {user.driver_status || 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.driver_category?.toLowerCase() === 'luxury' ? (
                            <Crown className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Car className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="capitalize">{user.driver_category || 'Comfort'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {user.referred_count}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No drivers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Load More Trigger */}
        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="min-w-[150px]"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Drivers"
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
