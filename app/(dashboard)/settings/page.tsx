"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useUser } from "@/lib/hooks/useUser"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Switch } from "@/app/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading, updateSession } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [settings, setSettings] = useState({
    units: "metric",
    language: "en",
    emailNotifications: true,
    mealReminders: false,
    expirationAlerts: true,
  })

  useEffect(() => {
    if (user?.settings) {
      setSettings({
        units: user.settings.units || "metric",
        language: user.settings.language || "en",
        emailNotifications: user.settings.notifications?.email ?? true,
        mealReminders: user.settings.notifications?.mealReminders ?? false,
        expirationAlerts: user.settings.notifications?.expirationAlerts ?? true,
      })
    }
  }, [user])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            units: settings.units,
            language: settings.language,
            notifications: {
              email: settings.emailNotifications,
              mealReminders: settings.mealReminders,
              expirationAlerts: settings.expirationAlerts,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      // Update locale cookie
      document.cookie = `locale=${settings.language}; path=/; max-age=31536000`

      setMessage("Settings updated successfully!")
      await updateSession()

      // Reload page to apply new locale
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      setError("Failed to update settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>App preferences and display settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Select
                value={settings.units}
                onValueChange={(value) => setSettings({ ...settings, units: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
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
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates and tips via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="meal-reminders">Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded to log your meals
                </p>
              </div>
              <Switch
                id="meal-reminders"
                checked={settings.mealReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, mealReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiration-alerts">Expiration Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when food is about to expire
                </p>
              </div>
              <Switch
                id="expiration-alerts"
                checked={settings.expirationAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, expirationAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <p className="text-sm text-muted-foreground capitalize">{user.provider || "credentials"}</p>
            </div>

            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {message && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <Button size="lg" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
