"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatCurrency, type BNPLPlan } from "@/lib/bnpl-utils"
import { CreditCard } from "lucide-react"

interface BNPLSelectorProps {
  totalAmount: number
  onPlanSelect: (plan: BNPLPlan | null) => void // 유지(호환), 항상 null 전달
  onProceed: () => void
  /** 선택: 부모에서 혼합 값을 받고 싶다면 사용 */
  onSplitChange?: (split: { method: "full" | "bnpl"; bnplAmount: number; cashAmount: number }) => void
}

const BNPL_LIMIT = 100_000 // 10만원 고정 한도

export function BNPLSelector({ totalAmount, onPlanSelect, onProceed, onSplitChange }: BNPLSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState<"full" | "bnpl">("full")
  const [bnplAmount, setBnplAmount] = useState<string>("")

  // BNPL 금액 최댓값: 총액과 정책 한도 중 더 작은 값
  const maxBnpl = useMemo(() => Math.max(0, Math.min(totalAmount, BNPL_LIMIT)), [totalAmount])

  const handleMethodChange = (method: "full" | "bnpl") => {
    setPaymentMethod(method)
    if (method === "full") {
      setBnplAmount("")
      onPlanSelect(null)
      onSplitChange?.({ method, bnplAmount: 0, cashAmount: totalAmount })
    }
  }

  // BNPL로 전환 시 기본값 = 가능한 최댓값 제안
  useEffect(() => {
    if (paymentMethod === "bnpl") {
      const initial = String(maxBnpl)
      setBnplAmount(initial)
      onPlanSelect(null)
      onSplitChange?.({ method: "bnpl", bnplAmount: Number(initial), cashAmount: totalAmount - Number(initial) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, maxBnpl, totalAmount])

  const parsed = Number.parseInt(bnplAmount || "0", 10)
  const isNumber = !Number.isNaN(parsed)

  // 유효성: BNPL을 선택한 경우 1원 이상, maxBnpl 이하
  const bnplValid = paymentMethod === "bnpl" && isNumber && parsed >= 1 && parsed <= maxBnpl

  const cashAmount = paymentMethod === "bnpl" && isNumber ? Math.max(0, totalAmount - parsed) : totalAmount
  const canProceed = paymentMethod === "full" || bnplValid

  // 상위로 혼합 값 통지(옵션)
  useEffect(() => {
    onSplitChange?.({
      method: paymentMethod,
      bnplAmount: paymentMethod === "bnpl" && isNumber ? parsed : 0,
      cashAmount,
    })
  }, [paymentMethod, parsed, isNumber, cashAmount, onSplitChange])

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          결제 방법 선택
        </CardTitle>
        <p className="text-sm text-gray-600">원하는 결제 방법을 선택해주세요</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={handleMethodChange}>
          {/* 일시불 */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="flex-1">
              <div className="flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <div className="font-bold">일시불 결제</div>
                  <div className="text-sm text-gray-600">(전액 결제)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg ml-[20px]">{formatCurrency(totalAmount)}</div>
                </div>
              </div>
            </Label>
          </div>

          {/* BNPL + 혼합 결제 (정책: 최대 10만원) */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bnpl" id="bnpl" />
            <Label htmlFor="bnpl" className="flex-1">
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <div className="mr-[20px]">
                    <div className="font-bold" >BNPL 분할결제 (혼합)</div>
                  </div>
                  <Badge variant="secondary">최대 {formatCurrency(maxBnpl)}</Badge>
                </div>

                {paymentMethod === "bnpl" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="bnplAmount" className="text-sm text-gray-700">BNPL</Label>
                      <Label htmlFor="bnplAmount" className="text-sm text-gray-700">1원 ~ {formatCurrency(maxBnpl)}</Label>
                      <Input
                        id="bnplAmount"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={maxBnpl}
                        value={bnplAmount}
                        onChange={(e) => {
                          const raw = e.target.value
                          const n = Number.parseInt(raw || "0", 10)
                          // 0 미만 방지 + 상한 클램프
                          const clamped = Number.isNaN(n) ? "" : String(Math.min(Math.max(n, 0), maxBnpl))
                          setBnplAmount(clamped)
                        }}
                        className="text-right"
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        
                      </div>
                      {!bnplValid && paymentMethod === "bnpl" && (
                        <div className="text-xs text-red-600 mt-1">
                          {isNumber ? "허용 범위를 벗어났습니다." : "숫자를 입력해주세요."}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 mt-1 text-right">
                        BNPL + 일시불 = {formatCurrency(totalAmount)}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-700 mb-[19px]">일시불(통장 출금)</Label>
                      <div className="h-10 flex items-center justify-end px-3 border rounded-md bg-gray-50">
                        <span className="font-medium">{formatCurrency(cashAmount)}</span>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Button
          className="w-full bg-hey-gradient text-white hover:opacity-90 shadow-lg transition-all duration-200 transform hover:scale-105"
          size="lg"
          onClick={onProceed}
          disabled={!canProceed}
        >
          {paymentMethod === "full" ? "결제하기" : "BNPL + 일시불로 진행"}
        </Button>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="font-medium text-sm">안전한 결제</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• SSL 암호화로 개인정보를 안전하게 보호합니다</p>
            <p>• 모든 결제는 안전한 PG사를 통해 처리됩니다</p>
            {paymentMethod === "bnpl" && (
              <>
                <p>• BNPL 이용 시 간단한 신용평가/신분 확인이 진행될 수 있습니다</p>
                <p>• 한도 초과 입력 시 자동으로 {formatCurrency(maxBnpl)} 까지만 허용됩니다</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
