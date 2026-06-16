export interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  tags: string[];
  dietary: string[];
  ingredients: string[];
  instructions: string[];
}

export const MEALS: Meal[] = [
  {
    id: 'grilled-chicken-quinoa',
    name: 'Grilled Chicken with Quinoa',
    description: 'Lean protein with complete grain and fresh vegetables',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop',
    calories: 450,
    protein: 45,
    carbs: 35,
    fat: 10,
    fiber: 6,
    cookTime: 25,
    difficulty: 'easy',
    cuisine: 'American',
    tags: ['high-protein', 'gluten-free', 'balanced'],
    dietary: [],
    ingredients: ['Chicken breast', 'Quinoa', 'Broccoli', 'Bell peppers', 'Olive oil'],
    instructions: [
      'Cook quinoa according to package directions',
      'Season and grill chicken breast until cooked through',
      'Steam broccoli for 5 minutes',
      'Toss vegetables with olive oil and serve',
    ],
  },
  {
    id: 'mediterranean-salmon',
    name: 'Mediterranean Baked Salmon',
    description: 'Omega-3 rich salmon with fresh herbs and Mediterranean flavors',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    calories: 480,
    protein: 42,
    carbs: 20,
    fat: 25,
    fiber: 5,
    cookTime: 20,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    tags: ['omega-3', 'heart-healthy', 'gluten-free'],
    dietary: [],
    ingredients: ['Salmon fillet', 'Lemon', 'Garlic', 'Olive oil', 'Herbs', 'Zucchini'],
    instructions: [
      'Preheat oven to 400F',
      'Place salmon on parchment paper',
      'Top with lemon slices, garlic, and herbs',
      'Bake for 15 minutes until cooked through',
    ],
  },
  {
    id: 'plant-based-buddha-bowl',
    name: 'Plant-Based Buddha Bowl',
    description: 'Colorful bowl packed with vegetables, legumes, and plant protein',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    calories: 420,
    protein: 18,
    carbs: 52,
    fat: 12,
    fiber: 12,
    cookTime: 30,
    difficulty: 'easy',
    cuisine: 'International',
    tags: ['vegan', 'high-fiber', 'colorful'],
    dietary: ['vegan', 'vegetarian'],
    ingredients: ['Chickpeas', 'Kale', 'Sweet potato', 'Avocado', 'Tahini', 'Quinoa'],
    instructions: [
      'Roast sweet potato cubes at 400F for 20 minutes',
      'Cook chickpeas in pan with spices',
      'Prepare kale salad base',
      'Assemble bowl with all components',
    ],
  },
  {
    id: 'turkey-lean-tacos',
    name: 'Lean Turkey Tacos',
    description: 'Low-fat protein in whole grain tortillas with fresh toppings',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop',
    calories: 380,
    protein: 38,
    carbs: 30,
    fat: 12,
    fiber: 6,
    cookTime: 15,
    difficulty: 'easy',
    cuisine: 'Mexican',
    tags: ['lean', 'quick', 'low-fat'],
    dietary: [],
    ingredients: ['Ground turkey', 'Whole grain tortillas', 'Lettuce', 'Tomato', 'Cilantro'],
    instructions: [
      'Brown ground turkey in skillet',
      'Season with taco spices',
      'Warm tortillas',
      'Assemble with fresh toppings',
    ],
  },
  {
    id: 'asian-stir-fry',
    name: 'Asian Vegetable Stir-Fry',
    description: 'Quick and colorful stir-fry with tofu and brown rice',
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b1?w=500&h=500&fit=crop',
    calories: 390,
    protein: 20,
    carbs: 45,
    fat: 12,
    fiber: 7,
    cookTime: 20,
    difficulty: 'easy',
    cuisine: 'Asian',
    tags: ['quick', 'vegetarian', 'low-oil'],
    dietary: ['vegetarian', 'vegan'],
    ingredients: ['Tofu', 'Broccoli', 'Snap peas', 'Brown rice', 'Ginger', 'Garlic'],
    instructions: [
      'Cook brown rice',
      'Press and cube tofu',
      'Heat wok and stir-fry vegetables',
      'Add tofu and sauce',
      'Serve over rice',
    ],
  },
  {
    id: 'greek-salad-chickpeas',
    name: 'Greek Salad with Chickpeas',
    description: 'Fresh Mediterranean salad with plant protein',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop',
    calories: 350,
    protein: 15,
    carbs: 38,
    fat: 14,
    fiber: 9,
    cookTime: 10,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    tags: ['vegetarian', 'quick', 'fresh'],
    dietary: ['vegetarian', 'vegan'],
    ingredients: ['Chickpeas', 'Cucumber', 'Tomato', 'Feta', 'Olives', 'Olive oil'],
    instructions: [
      'Chop all vegetables',
      'Combine with chickpeas',
      'Dress with olive oil and lemon',
      'Top with feta cheese',
    ],
  },
  {
    id: 'sweet-potato-bowl',
    name: 'Sweet Potato Power Bowl',
    description: 'Nutrient-dense bowl with roasted sweet potato and legumes',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    calories: 410,
    protein: 16,
    carbs: 58,
    fat: 10,
    fiber: 10,
    cookTime: 30,
    difficulty: 'easy',
    cuisine: 'International',
    tags: ['vegan', 'high-fiber', 'gluten-free'],
    dietary: ['vegan', 'vegetarian'],
    ingredients: ['Sweet potato', 'Black beans', 'Kale', 'Avocado', 'Pumpkin seeds'],
    instructions: [
      'Roast sweet potato until tender',
      'Warm black beans',
      'Sauté kale with garlic',
      'Assemble bowl and drizzle with tahini',
    ],
  },
  {
    id: 'baked-cod-vegetables',
    name: 'Baked Cod with Roasted Vegetables',
    description: 'Light, lean fish with colorful roasted vegetables',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    calories: 320,
    protein: 40,
    carbs: 28,
    fat: 8,
    fiber: 6,
    cookTime: 25,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    tags: ['low-calorie', 'lean', 'gluten-free'],
    dietary: [],
    ingredients: ['Cod fillet', 'Carrots', 'Zucchini', 'Brussels sprouts', 'Olive oil'],
    instructions: [
      'Preheat oven to 400F',
      'Place cod on baking sheet',
      'Surround with chopped vegetables',
      'Bake for 20 minutes until fish flakes easily',
    ],
  },
  {
    id: 'lentil-curry',
    name: 'Red Lentil Curry',
    description: 'Warm, aromatic curry with protein-rich lentils',
    image: 'https://images.unsplash.com/photo-1585094867166-ea5b5a3d4aa7?w=500&h=500&fit=crop',
    calories: 380,
    protein: 18,
    carbs: 52,
    fat: 10,
    fiber: 11,
    cookTime: 30,
    difficulty: 'medium',
    cuisine: 'Indian',
    tags: ['vegetarian', 'spicy', 'comfort-food'],
    dietary: ['vegetarian', 'vegan'],
    ingredients: ['Red lentils', 'Coconut milk', 'Onion', 'Garlic', 'Ginger', 'Curry spices'],
    instructions: [
      'Sauté aromatics in pot',
      'Add curry spices and toast briefly',
      'Add lentils and coconut milk',
      'Simmer until lentils are tender',
    ],
  },
  {
    id: 'chicken-wrap',
    name: 'Grilled Chicken Wrap',
    description: 'Portable protein-packed wrap with fresh vegetables',
    image: 'https://images.unsplash.com/photo-1528735602780-cf4f4a10ae86?w=500&h=500&fit=crop',
    calories: 360,
    protein: 36,
    carbs: 32,
    fat: 10,
    fiber: 5,
    cookTime: 15,
    difficulty: 'easy',
    cuisine: 'American',
    tags: ['portable', 'quick', 'high-protein'],
    dietary: [],
    ingredients: ['Chicken breast', 'Whole wheat wrap', 'Hummus', 'Lettuce', 'Tomato'],
    instructions: [
      'Grill or cook chicken breast',
      'Slice chicken into strips',
      'Warm wrap and spread hummus',
      'Fill with chicken and vegetables',
    ],
  },
];

export function getMealsForUser(
  dietaryRestrictions: string[] = [],
  cuisinePreferences: string[] = [],
  healthGoals: string[] = []
): Meal[] {
  return MEALS.filter((meal) => {
    // Check dietary restrictions
    if (dietaryRestrictions.length > 0) {
      const isCompatible = dietaryRestrictions.some((restriction) =>
        meal.dietary.includes(restriction)
      );
      if (dietaryRestrictions.some((r) => ['vegan', 'vegetarian'].includes(r))) {
        if (!isCompatible && !meal.dietary.some((d) => ['vegan', 'vegetarian'].includes(d))) {
          return false;
        }
      }
    }

    // Check cuisine preferences
    if (cuisinePreferences.length > 0) {
      if (!cuisinePreferences.includes(meal.cuisine)) {
        return false;
      }
    }

    // Filter by health goals
    if (healthGoals.includes('high-protein') && meal.protein < 30) {
      return false;
    }
    if (healthGoals.includes('low-calorie') && meal.calories > 400) {
      return false;
    }
    if (healthGoals.includes('high-fiber') && meal.fiber < 7) {
      return false;
    }

    return true;
  });
}

export function generateWeeklyPlan(availableMeals: Meal[]): Record<string, Meal[]> {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const plan: Record<string, Meal[]> = {};

  days.forEach((day) => {
    // Assign 3 random meals for each day (breakfast, lunch, dinner)
    const shuffled = [...availableMeals].sort(() => Math.random() - 0.5);
    plan[day] = shuffled.slice(0, 3);
  });

  return plan;
}
