'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meal, generateWeeklyPlan } from './meals';

interface MealContextType {
  weeklyPlan: Record<string, Meal[]>;
  generateNewPlan: (availableMeals: Meal[]) => void;
  replaceMeal: (day: string, mealIndex: number, newMeal: Meal) => void;
  getCurrentPlan: () => Record<string, Meal[]>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export function MealProvider({ children }: { children: React.ReactNode }) {
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, Meal[]>>({});

  // Load plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('nutrio_weekly_plan');
    if (savedPlan) {
      setWeeklyPlan(JSON.parse(savedPlan));
    }
  }, []);

  const generateNewPlan = (availableMeals: Meal[]) => {
    const newPlan = generateWeeklyPlan(availableMeals);
    setWeeklyPlan(newPlan);
    localStorage.setItem('nutrio_weekly_plan', JSON.stringify(newPlan));
  };

  const replaceMeal = (day: string, mealIndex: number, newMeal: Meal) => {
    const updatedPlan = { ...weeklyPlan };
    if (updatedPlan[day]) {
      updatedPlan[day][mealIndex] = newMeal;
      setWeeklyPlan(updatedPlan);
      localStorage.setItem('nutrio_weekly_plan', JSON.stringify(updatedPlan));
    }
  };

  const getCurrentPlan = () => weeklyPlan;

  return (
    <MealContext.Provider
      value={{
        weeklyPlan,
        generateNewPlan,
        replaceMeal,
        getCurrentPlan,
      }}
    >
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
