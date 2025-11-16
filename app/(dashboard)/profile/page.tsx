"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ProfileSkeleton } from "@/app/components/profile/skeletons/ProfileSkeleton"
import { Spinner } from "@/app/components/ui/spinner"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, updateSession } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goalType: "",
    targetWeight: "",
    dailyCalorieTarget: "",
    dietType: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.profile?.age?.toString() || "",
        gender: user.profile?.gender || "",
        height: user.profile?.height?.toString() || "",
        weight: user.profile?.weight?.toString() || "",
        activityLevel: user.profile?.activityLevel || "",
        goalType: user.goals?.goalType || "",
        targetWeight: user.goals?.targetWeight?.toString() || "",
        dailyCalorieTarget: user.goals?.dailyCalorieTarget?.toString() || "",
        dietType: user.preferences?.dietType || "",
      })
    }
  }, [user])

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          name: formData.name,
          profile: {
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender || undefined,
            height: formData.height ? parseInt(formData.height) : undefined,
            weight: formData.weight ? parseInt(formData.weight) : undefined,
            activityLevel: formData.activityLevel || undefined,
          },
          preferences: {
            dietType: formData.dietType || undefined,
          },
          goals: {
            goalType: formData.goalType || undefined,
            targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : undefined,
            dailyCalorieTarget: formData.dailyCalorieTarget
              ? parseInt(formData.dailyCalorieTarget)
              : undefined,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      setMessage("Profile updated successfully!")
      await updateSession()
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleChange("activityLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Health Goals</CardTitle>
            <CardDescription>Your health and fitness objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalType">Primary Goal</Label>
              <Select value={formData.goalType} onValueChange={(value) => handleChange("goalType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_weight">Gain Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="build_muscle">Build Muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => handleChange("targetWeight", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyCalorieTarget">Daily Calorie Target</Label>
                <Input
                  id="dailyCalorieTarget"
                  type="number"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) => handleChange("dailyCalorieTarget", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Diet Preferences</CardTitle>
            <CardDescription>Your dietary preferences and restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Type</Label>
              <Select value={formData.dietType} onValueChange={(value) => handleChange("dietType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific diet</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="low_carb">Low Carb</SelectItem>
                  <SelectItem value="gluten_free">Gluten Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

        <Button type="submit" size="lg" disabled={loading} className="relative">
          {loading && <Spinner size="sm" className="mr-2" />}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
