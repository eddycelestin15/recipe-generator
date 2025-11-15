"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Profile
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    // Goals
    goalType: "",
    targetWeight: "",
    dailyCalorieTarget: "",
    // Preferences
    dietType: "",
    allergies: "",
    dislikedIngredients: "",
  })

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
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

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Update user profile
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender || undefined,
            height: formData.height ? parseInt(formData.height) : undefined,
            weight: formData.weight ? parseInt(formData.weight) : undefined,
            activityLevel: formData.activityLevel || undefined,
            allergies: formData.allergies
              ? formData.allergies.split(",").map((a) => a.trim())
              : [],
          },
          preferences: {
            dietType: formData.dietType || undefined,
            dislikedIngredients: formData.dislikedIngredients
              ? formData.dislikedIngredients.split(",").map((i) => i.trim())
              : [],
          },
          goals: {
            goalType: formData.goalType || undefined,
            targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : undefined,
            dailyCalorieTarget: formData.dailyCalorieTarget
              ? parseInt(formData.dailyCalorieTarget)
              : undefined,
          },
          onboardingCompleted: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      router.push("/")
    } catch (error) {
      setError("Failed to save your information. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Recipe Health App!</CardTitle>
          <CardDescription>
            Let&apos;s personalize your experience (Step {step} of 3)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tell us about yourself</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
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
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
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
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What are your health goals?</h3>

              <div className="space-y-2">
                <Label htmlFor="goalType">Primary Goal</Label>
                <Select value={formData.goalType} onValueChange={(value) => handleChange("goalType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="gain_weight">Gain Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="build_muscle">Build Muscle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="65"
                  value={formData.targetWeight}
                  onChange={(e) => handleChange("targetWeight", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyCalorieTarget">Daily Calorie Target</Label>
                <Input
                  id="dailyCalorieTarget"
                  type="number"
                  placeholder="2000"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) => handleChange("dailyCalorieTarget", e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your dietary preferences</h3>

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

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  type="text"
                  placeholder="e.g., peanuts, shellfish"
                  value={formData.allergies}
                  onChange={(e) => handleChange("allergies", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dislikedIngredients">Disliked Ingredients (comma-separated)</Label>
                <Input
                  id="dislikedIngredients"
                  type="text"
                  placeholder="e.g., mushrooms, olives"
                  value={formData.dislikedIngredients}
                  onChange={(e) => handleChange("dislikedIngredients", e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-16 rounded-full ${
                  i === step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
