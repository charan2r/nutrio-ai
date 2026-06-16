'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Meal } from '@/lib/meals';
import { Clock, Flame } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  variant?: 'default' | 'compact';
}

export function MealCard({ meal, variant = 'default' }: MealCardProps) {
  const difficultyColor =
    meal.difficulty === 'easy' ? 'text-green-600' : meal.difficulty === 'medium' ? 'text-amber-600' : 'text-red-600';

  if (variant === 'compact') {
    return (
      <div className="flex gap-4 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-white cursor-pointer group">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
          <Image src={meal.image} alt={meal.name} fill className="object-cover group-hover:scale-105 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{meal.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{meal.calories} cal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>{meal.cookTime} min</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/meal/${meal.id}`}>
      <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image src={meal.image} alt={meal.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{meal.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{meal.description}</p>

          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-medium capitalize ${difficultyColor}`}>{meal.difficulty}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{meal.cuisine}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
            <div className="p-2 bg-muted rounded">
              <div className="font-bold text-foreground">{meal.calories}</div>
              <div className="text-muted-foreground">cal</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold text-foreground">{meal.protein}g</div>
              <div className="text-muted-foreground">protein</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold text-foreground">{meal.carbs}g</div>
              <div className="text-muted-foreground">carbs</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold text-foreground">{meal.fat}g</div>
              <div className="text-muted-foreground">fat</div>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {meal.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="w-3 h-3" />
              {meal.cookTime}m
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
