"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      // 로그인 성공 시 메인 페이지로 이동
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in-up hover-lift">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-purple-700 animate-slide-in-right">로그인</CardTitle>
        <CardDescription className="animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
          헤이영 스마트캠퍼스에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="email">대학교 이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@university.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring transition-all duration-200 focus:border-purple-400"
              required
            />
          </div>

          <div className="space-y-2 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring transition-all duration-200 focus:border-purple-400"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center animate-fade-in-up bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-hey-gradient text-white hover:opacity-90 animate-slide-in-right transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: "0.4s" }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                로그인 중...
              </span>
            ) : (
              "로그인"
            )}
          </Button>

          <div className="text-center animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{" "}
              <Link
                to="/auth/register"
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
