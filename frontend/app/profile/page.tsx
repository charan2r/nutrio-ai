'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Heart, Zap, Leaf } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updatePreferences } = useAuth();

  if (!user) {
    return null;
  }

  const prefs = user.preferences;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-primary mt-2 font-semibold">
                  {user.onboardingComplete ? '✓ Profile Complete' : 'Profile Setup Required'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/onboarding')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Edit Preferences
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dietary Restrictions */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Dietary Restrictions</h3>
            </div>
            {prefs?.dietaryRestrictions && prefs.dietaryRestrictions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {prefs.dietaryRestrictions.map((restriction) => (
                  <span
                    key={restriction}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No dietary restrictions set</p>
            )}
          </div>

          {/* Cuisine Preferences */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-foreground">Cuisine Preferences</h3>
            </div>
            {prefs?.cuisinePreferences && prefs.cuisinePreferences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {prefs.cuisinePreferences.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No cuisine preferences set</p>
            )}
          </div>

          {/* Health Goals */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-foreground">Health Goals</h3>
            </div>
            {prefs?.healthGoals && prefs.healthGoals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {prefs.healthGoals.map((goal) => (
                  <span
                    key={goal}
                    className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-medium"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No health goals set</p>
            )}
          </div>

          {/* Meal Settings */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Meal Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Meals per Day</label>
                <div className="text-2xl font-bold text-primary">{prefs?.mealsPerDay || 3}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Daily Calorie Target</label>
                <div className="text-2xl font-bold text-primary">{prefs?.calorieTarget || 2000} kcal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl border border-border p-8">
          <h3 className="text-xl font-bold text-foreground mb-6">Account Settings</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input type="text" value={user.name} disabled className="bg-muted cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-2">Change your name from your account settings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input type="email" value={user.email} disabled className="bg-muted cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-2">Email cannot be changed</p>
            </div>

            <div className="pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-4">Danger Zone</h4>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="text-3xl font-bold text-primary mb-2">7</div>
            <p className="text-muted-foreground">Days Planned</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="text-3xl font-bold text-accent mb-2">21</div>
            <p className="text-muted-foreground">Meals This Week</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{prefs?.calorieTarget || 2000}</div>
            <p className="text-muted-foreground">Daily Calorie Goal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center mb-12">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
