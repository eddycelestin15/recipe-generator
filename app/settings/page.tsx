import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import Footer from "@/app/components/Footer"

export const metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences"
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900 mt-1">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Plan</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      Free Forever
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-2">Free Plan Benefits</h3>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      50 fridge items
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      30 saved recipes
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      20 recipe generations per month
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      30 AI chat messages per month
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full">
                      Upgrade to Premium
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="meal-reminders" className="font-medium">Meal Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminded to log your meals</p>
                  </div>
                  <Switch id="meal-reminders" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="expiration-alerts" className="font-medium">Expiration Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when fridge items are expiring</p>
                  </div>
                  <Switch id="expiration-alerts" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Units</Label>
                  <p className="text-gray-900 mt-1">Metric</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Language</Label>
                  <p className="text-gray-900 mt-1">English</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/legal/privacy">
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Policy
                  </Button>
                </Link>
                <Link href="/legal/terms">
                  <Button variant="outline" className="w-full justify-start">
                    Terms & Conditions
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="destructive" className="w-full" type="submit">
                    Sign Out
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
