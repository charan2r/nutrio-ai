import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { NutrioGenerate } from '../generate/generate';
import { NutrioPlan } from '../plan/plan';
import { NutrioGrocery } from '../grocery/grocery';
import { NutrioFeedback } from '../feedback/feedback';

const COLORS = {
  brand: '#438e3b',
  brandDark: '#285d2b',
  brandButton: '#2e6b35',
  screenBg: '#f7faf5',
  cardBg: '#ffffff',
  cardBorder: '#e2ece0',
  heading: '#18202a',
  muted: '#7c8ba0',
  label: '#7c8490',
  iconBgGreen: '#edf6e5',
  iconColorGreen: '#438e3b',
  iconBgBlue: '#e3f2fd',
  iconColorBlue: '#0288d1',
  bannerBg: '#e7f3e4',
  bannerBorder: '#d8e8d2',
  progressTrack: '#e8efe6',
  chevron: '#9aa5b1',
};

export function NutrioHome() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'grocery' | 'profile'>('home');
  const [showPlanDetail, setShowPlanDetail] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedMealForFeedback, setSelectedMealForFeedback] = useState<{
    name: string;
    type: string;
    calories: number;
  } | null>(null);

  // Dynamic Dashboard State
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [caloriesConsumed, setCaloriesConsumed] = useState<number>(1480);
  const [dailyBudget, setDailyBudget] = useState<number>(700);
  const [budgetSpent, setBudgetSpent] = useState<number>(420);
  const [proteinTarget, setProteinTarget] = useState<number>(110);
  const [proteinConsumed, setProteinConsumed] = useState<number>(72);
  const [latestPlan, setLatestPlan] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [completedMeals, setCompletedMeals] = useState<{ [key: string]: boolean }>({
    breakfast: true,
    lunch: true,
    dinner: false,
  });

  // Fetch backend data on mount
  useEffect(() => {
    async function loadDashboardData() {
      setIsLoadingData(true);
      try {
        const [profileRes, prefRes, plansRes] = await Promise.allSettled([
          apiClient.get('/profile'),
          apiClient.get('/preferences'),
          apiClient.get('/meal-plans'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.data) {
          const p = profileRes.value.data;
          if (p.dailyCalorieTarget) {
            setCalorieTarget(Math.round(Number(p.dailyCalorieTarget)));
          }
        }

        if (prefRes.status === 'fulfilled' && prefRes.value.data) {
          const pr = prefRes.value.data;
          if (pr.dailyBudget) {
            setDailyBudget(Math.round(Number(pr.dailyBudget)));
          }
        }

        if (
          plansRes.status === 'fulfilled' &&
          Array.isArray(plansRes.value.data) &&
          plansRes.value.data.length > 0
        ) {
          const p = plansRes.value.data[0];
          setLatestPlan(p);
          if (p.totalCalories) {
            setCalorieTarget(Math.round(p.totalCalories / (p.durationDays || 7)));
          }
          if (p.estimatedCostLkr) {
            setBudgetSpent(Math.round(p.estimatedCostLkr / (p.durationDays || 7)));
          }
        }
      } catch (err) {
        console.log('Error loading dashboard data:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleMealComplete = (key: string) => {
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openFeedbackForMeal = (name: string, type: string, calories: number) => {
    setSelectedMealForFeedback({ name, type, calories });
    setShowFeedback(true);
  };

  const userName = user?.email?.split('@')[0] || 'Charan';
  const capitalizedUserName =
    userName.charAt(0).toUpperCase() + userName.slice(1);

  const currentTab: 'home' | 'plans' | 'grocery' | 'profile' = activeTab;

  const completedMealsCount = Object.values(completedMeals).filter(Boolean).length;
  const totalMealsCount = Object.keys(completedMeals).length;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / (calorieTarget || 2000)) * 100));
  const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);

  if (showFeedback) {
    return (
      <NutrioFeedback
        meal={selectedMealForFeedback}
        onBack={() => setShowFeedback(false)}
      />
    );
  }

  if (showPlanDetail) {
    return (
      <NutrioPlan
        planId={latestPlan?.id}
        onBack={() => setShowPlanDetail(false)}
      />
    );
  }

  if (activeTab === 'plans') {
    return <NutrioGenerate onBack={() => setActiveTab('home')} />;
  }

  if (activeTab === 'grocery') {
    return (
      <NutrioGrocery
        mealPlanId={latestPlan?.id}
        onBack={() => setActiveTab('home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background Pastel Blobs */}
      <View style={styles.bgBlobTopRight} pointerEvents="none" />
      <View style={styles.bgBlobBottomLeft} pointerEvents="none" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header / App Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons name="leaf" size={22} color={COLORS.brand} />
            </View>
            <Text style={styles.brandName}>
              Nutrio <Text style={styles.brandNameAccent}>AI</Text>
            </Text>
          </View>

          <View style={styles.topActions}>
            <Pressable
              style={styles.bellButton}
              onPress={() => Alert.alert('Notifications', 'No new meal plan alerts today.')}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.heading} />
              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              style={styles.avatarWrapper}
              onPress={() => Alert.alert('Profile', `Signed in as ${user?.email || 'Charan'}`)}
            >
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.avatarImage}
              />
            </Pressable>
          </View>
        </View>

        {/* Greeting Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Good morning, {capitalizedUserName}{' '}
            <MaterialCommunityIcons name="sprout" size={22} color={COLORS.brand} />
          </Text>
          <Text style={styles.heroSubtitle}>Ready for today&apos;s healthy meals?</Text>
        </View>

        {/* Main Calorie Progress Card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieLeft}>
            <View style={styles.calorieHeaderRow}>
              <MaterialCommunityIcons name="fire" size={20} color={COLORS.brand} />
              <Text style={styles.calorieHeaderTitle}>Calories</Text>
            </View>

            <View style={styles.calorieNumbersRow}>
              <Text style={styles.calorieCurrent}>{caloriesConsumed.toLocaleString()}</Text>
              <Text style={styles.calorieTarget}> / {calorieTarget.toLocaleString()} kcal</Text>
            </View>

            {/* Horizontal Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${caloriePercent}%` }]} />
            </View>

            <Text style={styles.calorieRemaining}>
              {caloriesRemaining.toLocaleString()} kcal remaining
            </Text>
          </View>

          {/* Right Circular Progress Ring */}
          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              <Text style={styles.ringPercent}>{caloriePercent}%</Text>
              <Text style={styles.ringLabel}>of goal</Text>
            </View>
          </View>
        </View>

        {/* 3-Stat Cards Row */}
        <View style={styles.statsRow}>
          {/* Budget */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Daily Budget', `Spent ₹${budgetSpent} of your ₹${dailyBudget} limit.`)}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgGreen }]}>
              <MaterialCommunityIcons name="wallet-outline" size={18} color={COLORS.iconColorGreen} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>₹{budgetSpent}</Text>
              <Text style={styles.statDetail}>of ₹{dailyBudget}</Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={COLORS.chevron} style={styles.statChevron} />
          </Pressable>

          {/* Meals */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Meals Progress', `${completedMealsCount} of ${totalMealsCount} meals completed today.`)}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgBlue }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={17} color={COLORS.iconColorBlue} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Meals</Text>
              <Text style={styles.statValue}>
                {completedMealsCount} <Text style={{ fontSize: 11, fontWeight: '500' }}>of</Text> {totalMealsCount}
              </Text>
              <Text style={styles.statDetail}>completed</Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={COLORS.chevron} style={styles.statChevron} />
          </Pressable>

          {/* Protein */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Protein Intake', `${proteinConsumed}g of ${proteinTarget}g protein target met.`)}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgGreen }]}>
              <MaterialCommunityIcons name="arm-flex" size={17} color={COLORS.iconColorGreen} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Protein</Text>
              <Text style={styles.statValue}>{proteinConsumed}g</Text>
              <Text style={styles.statDetail}>of {proteinTarget}g</Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={COLORS.chevron} style={styles.statChevron} />
          </Pressable>
        </View>

        {/* Generate Weekly Meal Plan Banner */}
        <Pressable
          style={({ pressed }) => [styles.generateBanner, pressed && { opacity: 0.92 }]}
          onPress={() => setActiveTab('plans')}
        >
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Generate Weekly{'\n'}Meal Plan</Text>
            <Text style={styles.bannerSubtitle}>
              Personalized meals,{'\n'}goals and grocery list.
            </Text>
          </View>

          {/* Graphic in Center */}
          <View style={styles.bannerGraphicWrapper}>
            <Image
              source={require('@/assets/images/nutrio-salad.png')}
              style={styles.bannerSalad}
              resizeMode="cover"
            />
          </View>

          {/* Action Arrow Button on Right */}
          <View style={styles.bannerArrowBtn}>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Today's Meals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
          <Pressable onPress={() => setShowPlanDetail(true)}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {/* 3 Meal Cards Grid */}
        <View style={styles.mealsGrid}>
          {/* 1. Breakfast */}
          <View style={styles.mealCard}>
            <Pressable
              style={styles.mealImageContainer}
              onPress={() => openFeedbackForMeal('Berry Oats Bowl', 'Breakfast', 420)}
            >
              <Image
                source={require('@/assets/images/food1.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#eef8eb' }]}>
                <Feather name="sun" size={13} color={COLORS.brand} />
              </View>
            </Pressable>

            <View style={styles.mealCardBody}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => openFeedbackForMeal('Berry Oats Bowl', 'Breakfast', 420)}
              >
                <Text style={styles.mealTypeName}>Breakfast</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Berry Oats Bowl</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleMealComplete('breakfast')}
                hitSlop={8}
              >
                {completedMeals.breakfast ? (
                  <View style={styles.checkCircleCompleted}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.checkCirclePending} />
                )}
              </Pressable>
            </View>
          </View>

          {/* 2. Lunch */}
          <View style={styles.mealCard}>
            <Pressable
              style={styles.mealImageContainer}
              onPress={() => openFeedbackForMeal('Quinoa Power Bowl', 'Lunch', 620)}
            >
              <Image
                source={require('@/assets/images/food2.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#fffbeb' }]}>
                <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
              </View>
            </Pressable>

            <View style={styles.mealCardBody}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => openFeedbackForMeal('Quinoa Power Bowl', 'Lunch', 620)}
              >
                <Text style={styles.mealTypeName}>Lunch</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Quinoa Power Bowl</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleMealComplete('lunch')}
                hitSlop={8}
              >
                {completedMeals.lunch ? (
                  <View style={styles.checkCircleCompleted}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.checkCirclePending} />
                )}
              </Pressable>
            </View>
          </View>

          {/* 3. Dinner */}
          <View style={styles.mealCard}>
            <Pressable
              style={styles.mealImageContainer}
              onPress={() => openFeedbackForMeal('Lemon Salmon', 'Dinner', 560)}
            >
              <Image
                source={require('@/assets/images/food3.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="moon" size={12} color="#8b5cf6" />
              </View>
            </Pressable>

            <View style={styles.mealCardBody}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => openFeedbackForMeal('Lemon Salmon', 'Dinner', 560)}
              >
                <Text style={styles.mealTypeName}>Dinner</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Lemon Salmon</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleMealComplete('dinner')}
                hitSlop={8}
              >
                {completedMeals.dinner ? (
                  <View style={styles.checkCircleCompleted}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.checkCirclePending} />
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Grocery Preview Card */}
        <Pressable
          style={({ pressed }) => [styles.groceryCard, pressed && { opacity: 0.9 }]}
          onPress={() => setActiveTab('grocery')}
        >
          <View style={styles.groceryIconWrapper}>
            <MaterialCommunityIcons name="shopping" size={20} color={COLORS.iconColorGreen} />
          </View>

          <View style={styles.groceryCopy}>
            <Text style={styles.groceryTitle}>Grocery Preview</Text>
            <Text style={styles.grocerySubtitle}>
              18 items · ₹{budgetSpent} estimated
            </Text>
          </View>

          {/* Right mini food badges */}
          <View style={styles.groceryRightItems}>
            <Text style={styles.groceryEmoji}>🍌</Text>
            <Text style={styles.groceryEmoji}>🥬</Text>
            <Text style={styles.groceryEmoji}>🍗</Text>
            <View style={styles.groceryCountPill}>
              <Text style={styles.groceryCountText}>+15</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={COLORS.chevron} style={{ marginLeft: 2 }} />
          </View>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Home */}
        <Pressable
          style={[styles.navItem, currentTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name="home"
            size={20}
            color={currentTab === 'home' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, currentTab === 'home' && styles.navTextActive]}>
            Home
          </Text>
        </Pressable>

        {/* Plans */}
        <Pressable
          style={[styles.navItem, currentTab === 'plans' && styles.navItemActive]}
          onPress={() => setActiveTab('plans')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={currentTab === 'plans' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, currentTab === 'plans' && styles.navTextActive]}>
            Plans
          </Text>
        </Pressable>

        {/* Grocery */}
        <Pressable
          style={[styles.navItem, currentTab === 'grocery' && styles.navItemActive]}
          onPress={() => setActiveTab('grocery')}
        >
          <MaterialCommunityIcons
            name="shopping-outline"
            size={20}
            color={currentTab === 'grocery' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, currentTab === 'grocery' && styles.navTextActive]}>
            Grocery
          </Text>
        </Pressable>

        {/* Profile */}
        <Pressable
          style={[styles.navItem, currentTab === 'profile' && styles.navItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={currentTab === 'profile' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, currentTab === 'profile' && styles.navTextActive]}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  screen: {
    flex: 1,
  },
  bgBlobTopRight: {
    position: 'absolute',
    width: 180,
    height: 160,
    right: -40,
    top: -20,
    borderRadius: 90,
    backgroundColor: '#EDF6E8',
    opacity: 0.6,
  },
  bgBlobBottomLeft: {
    position: 'absolute',
    width: 140,
    height: 140,
    left: -40,
    bottom: 50,
    borderRadius: 70,
    backgroundColor: '#EDF6E8',
    opacity: 0.4,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.5,
  },
  brandNameAccent: {
    color: COLORS.brand,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brand,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#438e3b',
  },
  avatarImage: {
    width: 36,
    height: 36,
  },

  // Hero Section
  heroSection: {
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.heading,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginTop: 3,
  },

  // Calorie Card
  calorieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  calorieLeft: {
    flex: 1,
  },
  calorieHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  calorieHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.heading,
  },
  calorieNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
    marginBottom: 7,
  },
  calorieCurrent: {
    fontSize: 25,
    fontWeight: '800',
    color: '#2e7d32',
    letterSpacing: -0.5,
  },
  calorieTarget: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.muted,
  },
  progressBarTrack: {
    width: '88%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.progressTrack,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.brand,
  },
  calorieRemaining: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 5.5,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFDF9',
  },
  ringPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.heading,
  },
  ringLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: -1,
  },

  // 3-Stat Cards Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 9,
    gap: 5,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.label,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.heading,
    marginTop: 1,
  },
  statDetail: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.muted,
  },
  statChevron: {
    flexShrink: 0,
  },

  // Generate Weekly Meal Plan Banner
  generateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bannerBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.bannerBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    shadowColor: '#2b412a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.heading,
    lineHeight: 19,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 11.5,
    color: '#4b5e4d',
    lineHeight: 15,
    marginTop: 3,
  },
  bannerGraphicWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  bannerSalad: {
    width: 64,
    height: 64,
  },
  bannerArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brandButton,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brandButton,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.4,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.brand,
  },

  // Today's Meals 3-Grid
  mealsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  mealCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  mealImageContainer: {
    width: '100%',
    height: 78,
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealTimeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    paddingVertical: 7,
    gap: 3,
  },
  mealTypeName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.heading,
  },
  mealDishName: {
    fontSize: 9.5,
    color: COLORS.muted,
    marginTop: 1,
  },
  checkCircleCompleted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCirclePending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },

  // Grocery Preview Card
  groceryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  groceryIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  groceryCopy: {
    flex: 1,
  },
  groceryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.heading,
  },
  grocerySubtitle: {
    fontSize: 10.5,
    color: COLORS.muted,
    marginTop: 1,
  },
  groceryRightItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  groceryEmoji: {
    fontSize: 13,
  },
  groceryCountPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: COLORS.iconBgGreen,
  },
  groceryCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2e7d32',
  },

  // Bottom Navigation Bar
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eef2ec',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 2,
  },
  navItemActive: {
    backgroundColor: COLORS.iconBgGreen,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.label,
  },
  navTextActive: {
    color: COLORS.brand,
    fontWeight: '700',
  },
});

export default NutrioHome;
