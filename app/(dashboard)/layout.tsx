import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-primary">
                Recipe Health
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
