'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMeals } from '@/lib/meal-context';
import { getMealsForUser, MEALS } from '@/lib/meals';
import { Header } from '@/components/header';
import { MealCard } from '@/components/meal-card';
import { NutritionStats } from '@/components/nutrition-stats';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { weeklyPlan, generateNewPlan } = useMeals();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.onboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // If no weekly plan exists, generate one
    if (Object.keys(weeklyPlan).length === 0) {
      const availableMeals = getMealsForUser(
        user.preferences?.dietaryRestrictions || [],
        user.preferences?.cuisinePreferences || [],
        user.preferences?.healthGoals || []
      );
      generateNewPlan(availableMeals);
    }
  }, [user, weeklyPlan, router, generateNewPlan]);

  const handleGenerateNewPlan = () => {
    setLoading(true);
    setTimeout(() => {
      const availableMeals = getMealsForUser(
        user?.preferences?.dietaryRestrictions || [],
        user?.preferences?.cuisinePreferences || [],
        user?.preferences?.healthGoals || []
      );
      generateNewPlan(availableMeals);
      setLoading(false);
    }, 500);
  };

  if (!user || !user.onboardingComplete) {
    return null;
  }

  const currentDayMeals = weeklyPlan[selectedDay] || [];
  const totalCalories = currentDayMeals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground">Your personalized weekly meal plan is ready</p>
        </div>

        {/* Day Selector */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-foreground border border-border hover:border-primary'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">{selectedDay}&apos;s Meals</h2>
            <Button
              onClick={handleGenerateNewPlan}
              disabled={loading}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'New Plan'}
            </Button>
          </div>
        </div>

        {/* Nutrition Summary for Selected Day */}
        {currentDayMeals.length > 0 && (
          <div className="mb-8">
            <NutritionStats meals={currentDayMeals} />
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentDayMeals.length > 0 ? (
            currentDayMeals.map((meal, idx) => <MealCard key={`${selectedDay}-${idx}`} meal={meal} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No meals planned for this day yet</p>
              <Button onClick={handleGenerateNewPlan} className="mt-4 bg-primary hover:bg-primary/90 text-white">
                Generate Plan
              </Button>
            </div>
          )}
        </div>

        {/* Weekly Overview */}
        <div className="bg-white rounded-2xl border border-border p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Weekly Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day) => {
              const dayMeals = weeklyPlan[day] || [];
              const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
              const mealCount = dayMeals.length;
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="font-semibold text-foreground mb-2">{day}</div>
                  <div className="text-sm text-muted-foreground mb-3">{mealCount} meals</div>
                  <div className="text-lg font-bold text-primary">{dayCalories} kcal</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
