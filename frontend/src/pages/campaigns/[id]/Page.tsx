

import { useState, useEffect } from "react"
import {  useRouter } from '@/compat/navigation'
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BNPLSelector } from "@/components/payment/bnpl-selector"
import { BNPLApplication } from "@/components/payment/bnpl-application"
import { PaymentProgress } from "@/components/payment/payment-progress"
import { mockCampaigns } from "@/lib/mock-data"
import { calculateMonthlyPayment, type BNPLPlan } from "@/lib/bnpl-utils"
import { ArrowLeft, Users, Calendar, TrendingDown, Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useParams,Link } from 'react-router-dom'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isJoining, setIsJoining] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedBNPLPlan, setSelectedBNPLPlan] = useState<BNPLPlan | null>(null)
  const [showBNPLApplication, setShowBNPLApplication] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)

  useEffect(() => {
    if (params.id === "create") {
      router.replace("/create-campaign")
      return
    }
  }, [params.id, router])

  if (params.id === "create") {
    return null
  }

  const campaign = mockCampaigns.find((c) => c.id === params.id)

  if (!campaign) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">공구를 찾을 수 없습니다</h1>
            <Link to="/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const progressPercentage = (campaign.currentQuantity / campaign.targetQuantity) * 100
  const discountPercentage = Math.round(
    ((campaign.product.originalPrice - campaign.discountPrice) / campaign.product.originalPrice) * 100,
  )
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const originalTotalPrice = campaign.product.originalPrice * quantity
  const discountTotalPrice = campaign.discountPrice * quantity
  const totalDiscountAmount = originalTotalPrice - discountTotalPrice
  const finalPrice = discountTotalPrice

  const isOwner = user?.email === campaign.createdBy || user?.name === campaign.createdBy

  const handleJoinCampaign = () => {
    setShowPayment(true)
    setPaymentStep(1)
  }

  const handlePaymentProceed = () => {
    if (selectedBNPLPlan) {
      setShowBNPLApplication(true)
      setPaymentStep(2)
    } else {
      // Handle regular payment
      setIsJoining(true)
      setPaymentStep(2)
      setTimeout(() => {
        router.push(`/payment/success?orderId=ORDER-${Date.now()}&method=full`)
      }, 1000)
    }
  }

  const handleBNPLSubmit = (applicationData: any) => {
    setPaymentStep(3)
    setTimeout(() => {
      router.push(`/payment/success?orderId=ORDER-${Date.now()}&method=bnpl`)
    }, 1000)
  }

  const handleDeleteCampaign = () => {
    if (window.confirm("정말로 이 공구를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setIsDeleting(true)
      // Mock API call
      setTimeout(() => {
        alert("공구가 성공적으로 삭제되었습니다.")
        router.push("/dashboard")
      }, 1000)
    }
  }

  const isPaymentAvailable =
    campaign.status === "active" || (daysLeft <= 0 && campaign.currentQuantity >= campaign.targetQuantity)
  const isExpiredButAchieved = daysLeft <= 0 && campaign.currentQuantity >= campaign.targetQuantity

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section with Product Image and Key Info */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  대시보드로 돌아가기
                </Button>
              </Link>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Link to={`/campaigns/${campaign.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      수정
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:border-red-300 bg-transparent"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={handleDeleteCampaign}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "삭제 중..." : "삭제"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1">
                <img
                  src={campaign.product.imageUrl || "/placeholder.svg"}
                  alt={campaign.product.name}
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    variant={campaign.status === "active" ? "default" : "secondary"}
                    className="bg-hey-gradient text-white"
                  >
                    {campaign.status === "active" ? "진행중" : isExpiredButAchieved ? "마감완료" : "완료"}
                  </Badge>
                  {isOwner && (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      내가 만든 공구
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                <h2 className="text-xl text-gray-600 mb-4">{campaign.product.name}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{discountPercentage}%</div>
                    <div className="text-sm text-blue-700">할인율</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{campaign.currentQuantity}</div>
                    <div className="text-sm text-green-700">참여자</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{daysLeft <= 0 ? "마감" : daysLeft}</div>
                    <div className="text-sm text-orange-700">{daysLeft <= 0 ? "상태" : "남은 일수"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                    <div className="text-sm text-purple-700">달성률</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reorganized Left Column with Progress and Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card with Enhanced Visual Design */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-hey-gradient rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    참여 현황
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {campaign.currentQuantity} / {campaign.targetQuantity}
                    </div>
                    <div className="text-gray-600">명 참여</div>
                  </div>

                  <div className="relative">
                    <Progress value={progressPercentage} className="h-4 bg-gray-200" />
                    <div
                      className="absolute inset-0 bg-hey-gradient rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {campaign.targetQuantity - campaign.currentQuantity}명
                      </div>
                      <div className="text-sm text-gray-600">더 필요</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {(campaign.product.originalPrice - campaign.discountPrice).toLocaleString()}원
                      </div>
                      <div className="text-sm text-gray-600">개당 절약</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>상품 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">{campaign.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>개설자: {campaign.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>마감: {new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Right Sidebar with Sticky Positioning */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {showPayment && (
                  <PaymentProgress currentStep={paymentStep} paymentMethod={selectedBNPLPlan ? "bnpl" : "full"} />
                )}

                {!showPayment ? (
                  <>
                    {/* Enhanced Price Card */}
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50 to-pink-50">
                      <CardHeader className="text-center pb-4">
                        <div className="inline-flex items-center gap-2 bg-hey-gradient text-white px-4 py-2 rounded-full text-sm font-bold">
                          <TrendingDown className="w-4 h-4" />
                          특가 혜택
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-500 line-through">
                            정가 {campaign.product.originalPrice.toLocaleString()}원
                          </div>
                          <div className="text-3xl font-bold text-purple-600">
                            {campaign.discountPrice.toLocaleString()}원
                          </div>
                          <Badge variant="destructive" className="bg-red-500 font-bold">
                            {discountPercentage}% 할인
                          </Badge>
                        </div>

                        {isPaymentAvailable && (
                          <div className="space-y-4 pt-4 border-t">
                            {isExpiredButAchieved && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-green-700 font-medium">
                                  ✅ 최소인원 달성으로 결제 가능합니다!
                                </p>
                              </div>
                            )}

                            {campaign.status === "active" && (
                              <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-sm font-medium">
                                  수량 선택
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 p-0"
                                  >
                                    -
                                  </Button>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                                    className="text-center appearance-none"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                    className="w-10 h-10 p-0"
                                  >
                                    +
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500">최대 5개까지 주문 가능</p>
                              </div>
                            )}

                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">정가 ({quantity}개)</span>
                                <span className="line-through text-gray-500">
                                  {originalTotalPrice.toLocaleString()}원
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-red-600 font-medium">할인금액</span>
                                <span className="text-red-600 font-medium">
                                  -{totalDiscountAmount.toLocaleString()}원
                                </span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-lg">총 결제금액</span>
                                  <span className="text-2xl font-bold text-purple-600">
                                    {finalPrice.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-hey-gradient hover:opacity-90 text-white shadow-lg"
                              size="lg"
                              onClick={handleJoinCampaign}
                            >
                              결제 방법 선택하기
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                              {isExpiredButAchieved
                                ? "최소인원이 달성되어 결제가 가능합니다."
                                : "목표 수량 달성 시 자동으로 주문이 확정됩니다."}
                            </p>
                          </div>
                        )}

                        {!isPaymentAvailable && daysLeft <= 0 && campaign.currentQuantity < campaign.targetQuantity && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-700 font-medium">공구가 마감되었습니다</p>
                            <p className="text-sm text-red-600 mt-1">최소인원 미달로 결제할 수 없습니다</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : !showBNPLApplication ? (
                  <BNPLSelector
                    totalAmount={finalPrice}
                    onPlanSelect={setSelectedBNPLPlan}
                    onProceed={handlePaymentProceed}
                  />
                ) : (
                  selectedBNPLPlan && (
                    <BNPLApplication
                      plan={selectedBNPLPlan}
                      totalAmount={finalPrice}
                      monthlyPayment={calculateMonthlyPayment(finalPrice, selectedBNPLPlan)}
                      onSubmit={handleBNPLSubmit}
                      onCancel={() => {
                        setShowBNPLApplication(false)
                        setPaymentStep(1)
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
