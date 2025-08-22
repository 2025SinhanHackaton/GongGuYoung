import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/dashboard/campaign-card";
import { CampaignFilters } from "@/components/dashboard/campaign-filters";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { mockCampaigns } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import Image from "@/compat/NextImage";
import { Plus, Users, ShoppingCart, TrendingUp, User } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    category: "전체",
    search: "",
    status: "all",
  });

  const filteredCampaigns = useMemo(() => {
    const now = Date.now();
    const endOfDay = (dateStr: string) => {
      // "YYYY-MM-DD"를 하루의 끝(23:59:59.999)으로 맞춰서 비교
      const d = new Date(dateStr);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    };

    return mockCampaigns
      .filter((c) => c.status !== "cancelled") // 취소는 항상 제외
      .filter((campaign) => {
        const matchesSearch =
          campaign.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          campaign.product.name
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        // 현재 시간 기준 파생 상태
        const isActive = now <= endOfDay(campaign.endDate);
        const derivedStatus = isActive ? "active" : "completed";

        const matchesStatus =
          filters.status === "all" ||
          (filters.status === "active" && derivedStatus === "active") ||
          (filters.status === "completed" && derivedStatus === "completed");

        return matchesSearch && matchesStatus;
      });
  }, [filters]);

  const stats = {
    activeCampaigns: mockCampaigns.filter((c) => c.status === "active").length,
    totalParticipants: mockCampaigns.reduce(
      (sum, c) => sum + c.participants,
      0
    ),
    completedCampaigns: mockCampaigns.filter((c) => c.status === "completed")
      .length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <header className="bg-hey-gradient shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Image
                  src="/hey-young-logo.png"
                  alt="Hey Young Smart Campus"
                  width={48}
                  height={48}
                  className="rounded-xl bg-white/20 p-2"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    공동구매 플랫폼
                  </h1>
                  <p className="text-purple-100">
                    안녕하세요, {user?.fullName}님!
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <NotificationBell />
                <Link to="/my-page">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <User className="w-4 h-4 mr-2" />
                    마이 페이지
                  </Button>
                </Link>
                <Link to="/create-campaign">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Plus className="w-4 h-4 mr-2" />
                    공구 만들기
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-white hover:bg-white/20"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <CampaignFilters onFilterChange={setFilters} />

          {/* Campaign Grid */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6 text-purple-800">
              공동구매 목록 ({filteredCampaigns.length}개)
            </h2>

            {filteredCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  조건에 맞는 공동구매가 없습니다.
                </p>
                <Link to="/create-campaign">
                  <Button className="mt-4 bg-hey-gradient hover:opacity-90 text-white">
                    새 공구 만들기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
