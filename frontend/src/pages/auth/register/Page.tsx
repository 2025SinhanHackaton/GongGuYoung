import { RegisterForm } from "@/components/auth/register-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import Image from '@/compat/NextImage'
import { Home } from "lucide-react"

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-3">
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
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <RegisterForm />
        </div>
      </div>
    </AuthGuard>
  )
}
