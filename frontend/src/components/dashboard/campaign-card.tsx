import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GroupCampaign } from "@/lib/mock-data";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  campaign: GroupCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage =
    (campaign.currentQuantity / campaign.targetQuantity) * 100;
  const discountPercentage = Math.round(
    ((campaign.product.originalPrice - campaign.discountPrice) /
      campaign.product.originalPrice) *
      100
  );
  const endOfDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };
  const now = Date.now();
  const isActive = now <= endOfDay(campaign.endDate);
  const derivedStatus: "active" | "completed" = isActive
    ? "active"
    : "completed";
  const daysLeft = Math.max(
    0,
    Math.ceil((endOfDay(campaign.endDate) - now) / (1000 * 60 * 60 * 24))
  );
  return (
    <Card className="hover:shadow-xl transition-all duration-500 border-purple-100 hover:border-purple-200 hover-lift animate-scale-in group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge
            variant={derivedStatus === "active" ? "default" : "secondary"}
            className={`${
              derivedStatus === "active"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse-slow"
                : ""
            } transition-all duration-300`}
          >
            {derivedStatus === "active" ? "진행중" : "완료"}
          </Badge>
        </div>
        <CardTitle className="text-lg text-purple-800 group-hover:text-purple-900 transition-colors duration-300">
          {campaign.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <img
            src={campaign.product.imageUrl || "/placeholder.svg"}
            alt={campaign.product.name}
            className="w-20 h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 hover:shadow-md"
          />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{campaign.product.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>
              {campaign.currentQuantity}/{campaign.targetQuantity}명
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 bg-purple-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 [&>div]:transition-all [&>div]:duration-1000 [&>div]:animate-shimmer"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600">
                {campaign.discountPrice.toLocaleString()}원
              </span>
              <Badge variant="destructive" className="text-xs">
                {discountPercentage}% 할인
              </Badge>
            </div>
            <span className="text-sm text-gray-500 line-through">
              {campaign.product.originalPrice.toLocaleString()}원
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{derivedStatus === "active" ? `${daysLeft}일 남음` : "마감"}</div>
          </div>
        </div>

        <Link to={`/campaigns/${campaign.id}`}>
          <Button
            className={`w-full transition-all duration-300 ${derivedStatus === "active" ? "bg-hey-gradient text-white hover:opacity-90 hover:shadow-lg" : ""}`}
            disabled={derivedStatus !== "active"}
          >
            {derivedStatus === "active" ? "참여하기" : "완료됨"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
