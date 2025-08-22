

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Link } from 'react-router-dom'
import Image from '@/compat/NextImage'
import { Bell, QrCode, CreditCard, Plus, LogIn, LogOut } from "lucide-react"

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-hey-gradient">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/hey-young-logo.png"
                alt="Hey Young Smart Campus"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Hey Young</h1>
                <p className="text-xs text-white/80">Smart Campus</p>
              </div>
            </div>
            <div className="flex gap-1">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <CreditCard className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2" onClick={() => logout()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <LogIn className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Left Column - Student ID Card */}
          <div className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center pb-2">
                <p className="text-sm text-gray-600">학생증</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👩‍🎓</span>
                  </div>
                  <div className="text-left">
                    {user ? (
                      <>
                        <p className="text-sm text-gray-600">한국대학교 MSA학과</p>
                        <p className="font-bold text-lg">{user.fullName}</p>
                        <p className="text-xs text-gray-500">202412345</p>
                      </>
                    ) : (
                      <p className="font-bold text-lg">로그인이 필요합니다</p>
                    )}
                  </div>
                </div>
                <Button className="w-full bg-hey-gradient hover:opacity-90 text-white">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR 코드
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-gray-800">빠른 실행</h3>
                {user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/dashboard">
                      <Button className="w-full bg-hey-gradient hover:opacity-90 text-white text-sm">
                        <Plus className="w-4 h-4 mr-1" />
                        공동구매
                      </Button>
                    </Link>
                    <Link to="/my-page">
                      <Button
                        variant="outline"
                        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-sm bg-transparent"
                      >
                        마이페이지
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">로그인 후 이용할 수 있습니다</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/auth/login">
                        <Button className="w-full bg-hey-gradient hover:opacity-90 text-white text-sm">
                          로그인
                        </Button>
                      </Link>
                      <Link to="/auth/register">
                        <Button
                          variant="outline"
                          className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-sm bg-transparent"
                        >
                          회원가입
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - MY메뉴 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">MY메뉴</h2>
              <Button variant="ghost" size="sm">
                ⋯
              </Button>
            </div>

            {user ? (
              <div className="grid grid-cols-3 gap-4">
                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    📋
                  </div>
                  <span className="text-xs text-gray-700 text-center">공지사항</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    📚
                  </div>
                  <span className="text-xs text-gray-700 text-center">학사정보</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    📊
                  </div>
                  <span className="text-xs text-gray-700 text-center">출결조회</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    💬
                  </div>
                  <span className="text-xs text-gray-700 text-center">커뮤니티</span>
                </Link>

                <Link to="/bnpl"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    💳
                  </div>
                  <span className="text-xs text-gray-700 text-center">BNPL</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                    🏪
                  </div>
                  <span className="text-xs text-gray-700 text-center">학교상점</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    🍽️
                  </div>
                  <span className="text-xs text-gray-700 text-center">학식메뉴</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
                    🎓
                  </div>
                  <span className="text-xs text-gray-700 text-center">학과 행사</span>
                </Link>

                <Link to="/dashboard"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                    📖
                  </div>
                  <span className="text-xs text-gray-700 text-center">과제제출</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🔒
                </div>
                <p className="text-gray-500 mb-4">로그인이 필요한 서비스입니다</p>
                <div className="flex gap-3">
                  <Link to="/auth/login" className="flex-1">
                    <Button className="w-full bg-hey-gradient hover:opacity-90 text-white">로그인</Button>
                  </Link>
                  <Link to="/auth/register" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      회원가입
                    </Button>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
