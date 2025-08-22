"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  fullName: string
  studentId?: string
  university?: {
    id: string
    name: string
    domain: string
  }
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // 먼저 쿠키에서 사용자 정보 확인
        const memberCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('member='))
          ?.split('=')[1]

        if (memberCookie) {
          try {
            // Base64 URL 디코딩
            const base64String = memberCookie.replace(/-/g, '+').replace(/_/g, '/')
            const paddedBase64 = base64String + '='.repeat((4 - base64String.length % 4) % 4)
            
            // UTF-8 안전 디코딩
            const binaryString = atob(paddedBase64)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            const utf8String = new TextDecoder('utf-8').decode(bytes)
            const decoded = JSON.parse(utf8String)
            
            const restoredUser: User = {
              id: decoded.id.toString(),
              email: decoded.email,
              fullName: decoded.name,
              studentId: undefined,
              university: undefined,
              isVerified: true,
            }

            setUser(restoredUser)
            localStorage.setItem("auth_token", decoded.userKey || "")
            localStorage.setItem("user_data", JSON.stringify(restoredUser))
          } catch (decodeError) {
            console.error("쿠키 디코딩 실패:", decodeError)
            // 쿠키가 손상된 경우 정리
            document.cookie = 'member=; Max-Age=0; path=/'
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        } else {
          // 쿠키가 없으면 localStorage에서 확인 (fallback)
          const token = localStorage.getItem("auth_token")
          const userData = localStorage.getItem("user_data")
          if (token && userData) {
            setUser(JSON.parse(userData))
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include', // 쿠키 포함
      })

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다.')
      }

      // 쿠키에서 사용자 정보 읽기
      const memberCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('member='))
        ?.split('=')[1]

      if (memberCookie) {
        try {
          // Base64 URL 디코딩을 위한 안전한 방법
          const base64String = memberCookie.replace(/-/g, '+').replace(/_/g, '/')
          const paddedBase64 = base64String + '='.repeat((4 - base64String.length % 4) % 4)
          
          // UTF-8 안전 디코딩
          const binaryString = atob(paddedBase64)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const utf8String = new TextDecoder('utf-8').decode(bytes)
          const decoded = JSON.parse(utf8String)
          
          const loggedInUser: User = {
            id: decoded.id.toString(),
            email: decoded.email,
            fullName: decoded.name,
            studentId: undefined,
            university: undefined,
            isVerified: true,
          }

          setUser(loggedInUser)
          localStorage.setItem("auth_token", decoded.userKey || "")
          localStorage.setItem("user_data", JSON.stringify(loggedInUser))
        } catch (decodeError) {
          console.error("쿠키 디코딩 실패:", decodeError)
          throw new Error("로그인 정보 처리에 실패했습니다.")
        }
      }
    } catch (error) {
      throw new Error("로그인에 실패했습니다.")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
        }),
      })

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.')
      }

      const signupResponse = await response.json()
      
      // 회원가입 성공해도 자동 로그인하지 않음
    } catch (error) {
      throw new Error("회원가입에 실패했습니다.")
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/v1/logout', {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
      })
    } catch (error) {
      console.error("로그아웃 요청 실패:", error)
    } finally {
      // API 호출 성공 여부와 관계없이 로컬 상태는 정리
      setUser(null)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
