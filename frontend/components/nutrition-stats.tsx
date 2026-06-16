'use client';

import { Meal } from '@/lib/meals';

interface NutritionStatsProps {
  meals: Meal[];
  compact?: boolean;
}

export function NutritionStats({ meals, compact = false }: NutritionStatsProps) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  const totalFiber = meals.reduce((sum, meal) => sum + meal.fiber, 0);

  const stats = [
    { label: 'Calories', value: totalCalories, unit: 'kcal', color: 'text-orange-600' },
    { label: 'Protein', value: totalProtein, unit: 'g', color: 'text-red-600' },
    { label: 'Carbs', value: totalCarbs, unit: 'g', color: 'text-blue-600' },
    { label: 'Fat', value: totalFat, unit: 'g', color: 'text-yellow-600' },
    { label: 'Fiber', value: totalFiber, unit: 'g', color: 'text-green-600' },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-2 bg-muted rounded-lg">
            <div className={`font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Daily Nutrition</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-4 bg-muted rounded-lg">
            <div className={`text-2xl font-bold ${stat.color} mb-2`}>
              {stat.value}
              <span className="text-xs ml-1">{stat.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
