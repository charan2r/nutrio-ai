'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMeals } from '@/lib/meal-context';
import { getMealsForUser } from '@/lib/meals';
import { Button } from '@/components/ui/button';
import { Leaf, CheckCircle2 } from 'lucide-react';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'];
const CUISINE_OPTIONS = ['American', 'Mediterranean', 'Asian', 'Indian', 'Mexican'];
const HEALTH_GOALS = ['High-protein', 'Low-calorie', 'High-fiber', 'Balanced'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updatePreferences, completeOnboarding } = useAuth();
  const { generateNewPlan } = useMeals();

  const [step, setStep] = useState(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [calorieTarget, setCalorieTarget] = useState(2000);

  if (!user) {
    return null;
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    updatePreferences({
      dietaryRestrictions,
      cuisinePreferences,
      healthGoals,
      mealsPerDay,
      calorieTarget,
      allergies: [],
    });

    // Generate initial meal plan
    const availableMeals = getMealsForUser(dietaryRestrictions, cuisinePreferences, healthGoals);
    generateNewPlan(availableMeals);

    completeOnboarding();
    router.push('/dashboard');
  };

  const toggleSelection = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Let&apos;s Get Started</h1>
          <p className="text-muted-foreground mt-2">Step {step} of 4: Set your preferences</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded-full transition-all ${num <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 min-h-96">
          {/* Step 1: Dietary Restrictions */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Dietary Restrictions</h2>
              <p className="text-muted-foreground mb-6">Select any restrictions that apply to you (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option.toLowerCase(), setDietaryRestrictions, dietaryRestrictions)}
                    className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                      dietaryRestrictions.includes(option.toLowerCase())
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          dietaryRestrictions.includes(option.toLowerCase())
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {dietaryRestrictions.includes(option.toLowerCase()) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Cuisine Preferences */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Cuisine Preferences</h2>
              <p className="text-muted-foreground mb-6">What cuisines do you enjoy? (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                {CUISINE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option, setCuisinePreferences, cuisinePreferences)}
                    className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                      cuisinePreferences.includes(option)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          cuisinePreferences.includes(option) ? 'border-primary bg-primary' : 'border-border'
                        }`}
                      >
                        {cuisinePreferences.includes(option) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Health Goals */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Health Goals</h2>
              <p className="text-muted-foreground mb-6">What&apos;s your primary health goal? (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                {HEALTH_GOALS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option.toLowerCase(), setHealthGoals, healthGoals)}
                    className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                      healthGoals.includes(option.toLowerCase())
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          healthGoals.includes(option.toLowerCase()) ? 'border-primary bg-primary' : 'border-border'
                        }`}
                      >
                        {healthGoals.includes(option.toLowerCase()) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Settings */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Meal Preferences</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Meals per Day</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMealsPerDay(num)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                          mealsPerDay === num
                            ? 'border-primary bg-primary text-white'
                            : 'border-border text-foreground hover:border-primary/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Daily Calorie Target: {calorieTarget} kcal
                  </label>
                  <input
                    type="range"
                    min="1200"
                    max="3500"
                    step="100"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1200</span>
                    <span>3500</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-8 border-border hover:border-primary"
          >
            Previous
          </Button>

          {step === 4 ? (
            <Button onClick={handleComplete} className="px-8 bg-primary hover:bg-primary/90 text-white font-semibold">
              Create My Plan
            </Button>
          ) : (
            <Button onClick={handleNext} className="px-8 bg-primary hover:bg-primary/90 text-white font-semibold">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
