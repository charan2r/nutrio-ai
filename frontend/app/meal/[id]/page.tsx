'use client';

import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { MEALS } from '@/lib/meals';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { NutritionStats } from '@/components/nutrition-stats';
import { Clock, ChefHat, Flame } from 'lucide-react';

export default function MealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const mealId = typeof params.id === 'string' ? params.id : '';
  const meal = MEALS.find((m) => m.id === mealId);

  if (!meal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Meal not found</h1>
            <Button onClick={() => router.push('/dashboard')} className="bg-primary hover:bg-primary/90 text-white">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const difficultyColor = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-amber-600 bg-amber-50',
    hard: 'text-red-600 bg-red-50',
  }[meal.difficulty];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button onClick={() => router.back()} className="text-primary hover:underline mb-8 flex items-center gap-2">
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative h-96 lg:h-full rounded-2xl overflow-hidden">
            <Image src={meal.image} alt={meal.name} fill className="object-cover" />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{meal.name}</h1>
                <p className="text-lg text-muted-foreground">{meal.description}</p>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap mb-8">
              <span className={`px-4 py-2 rounded-lg font-semibold capitalize ${difficultyColor}`}>
                {meal.difficulty}
              </span>
              <span className="px-4 py-2 rounded-lg font-semibold bg-primary/10 text-primary">{meal.cuisine}</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Calories</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{meal.calories} kcal</div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Cook Time</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{meal.cookTime} min</div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ChefHat className="w-4 h-4" />
                  <span className="text-sm">Protein</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{meal.protein}g</div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-sm">Fiber</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{meal.fiber}g</div>
              </div>
            </div>

            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
              Add to Favorites
            </Button>
          </div>
        </div>

        {/* Nutrition Facts */}
        <NutritionStats meals={[meal]} />

        {/* Ingredients and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Ingredients */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
            <ul className="space-y-3">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-center gap-3 text-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Instructions</h2>
            <ol className="space-y-4">
              {meal.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-foreground pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-12 mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Tags</h2>
          <div className="flex gap-2 flex-wrap">
            {meal.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium hover:bg-accent/20 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
