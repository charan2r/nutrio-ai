import React, { useState } from 'react';
import {
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
import { useAuthStore } from '@/lib/auth-store';

import { NutrioGenerate } from '../generate/generate';
import { NutrioPlan } from '../plan/plan';

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
  const [completedMeals, setCompletedMeals] = useState<{ [key: string]: boolean }>({
    breakfast: true,
    lunch: true,
    dinner: false,
  });

  const toggleMealComplete = (key: string) => {
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const userName = user?.email?.split('@')[0] || 'Charan';
  const capitalizedUserName =
    userName.charAt(0).toUpperCase() + userName.slice(1);

  if (showPlanDetail) {
    return <NutrioPlan onBack={() => setShowPlanDetail(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background Pastel Blobs */}
      <View style={styles.bgBlobTopRight} pointerEvents="none" />
      <View style={styles.bgBlobBottomLeft} pointerEvents="none" />

      {activeTab === 'plans' ? (
        <NutrioGenerate onBack={() => setActiveTab('home')} />
      ) : (
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
              <Ionicons name="notifications-outline" size={22} color={COLORS.heading} />
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
              <Text style={styles.calorieCurrent}>1,480</Text>
              <Text style={styles.calorieTarget}> / 2,000 kcal</Text>
            </View>

            {/* Horizontal Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '74%' }]} />
            </View>

            <Text style={styles.calorieRemaining}>520 kcal remaining</Text>
          </View>

          {/* Right Circular Progress Ring */}
          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              <Text style={styles.ringPercent}>74%</Text>
              <Text style={styles.ringLabel}>of goal</Text>
            </View>
          </View>
        </View>

        {/* 3-Stat Cards Row */}
        <View style={styles.statsRow}>
          {/* Budget */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Daily Budget', 'Spent ₹420 of your ₹700 daily limit.')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgGreen }]}>
              <MaterialCommunityIcons name="wallet-outline" size={19} color={COLORS.iconColorGreen} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>₹420</Text>
              <Text style={styles.statDetail}>of ₹700</Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={COLORS.chevron} style={styles.statChevron} />
          </Pressable>

          {/* Meals */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Meals Progress', '2 of 3 scheduled meals consumed.')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgBlue }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={COLORS.iconColorBlue} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Meals</Text>
              <Text style={styles.statValue}>2 <Text style={{ fontSize: 11, fontWeight: '500' }}>of</Text> 3</Text>
              <Text style={styles.statDetail}>completed</Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={COLORS.chevron} style={styles.statChevron} />
          </Pressable>

          {/* Protein */}
          <Pressable
            style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Protein Intake', '72g of 110g protein target met.')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.iconBgGreen }]}>
              <MaterialCommunityIcons name="arm-flex" size={18} color={COLORS.iconColorGreen} />
            </View>
            <View style={styles.statCopy}>
              <Text style={styles.statLabel}>Protein</Text>
              <Text style={styles.statValue}>72g</Text>
              <Text style={styles.statDetail}>of 110g</Text>
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
            <View style={styles.mealImageContainer}>
              <Image
                source={require('@/assets/images/food1.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#eef8eb' }]}>
                <Feather name="sun" size={13} color={COLORS.brand} />
              </View>
            </View>

            <View style={styles.mealCardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTypeName}>Breakfast</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Berry Oats Bowl</Text>
              </View>
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
            <View style={styles.mealImageContainer}>
              <Image
                source={require('@/assets/images/food2.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#fffbeb' }]}>
                <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
              </View>
            </View>

            <View style={styles.mealCardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTypeName}>Lunch</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Quinoa Power Bowl</Text>
              </View>
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
            <View style={styles.mealImageContainer}>
              <Image
                source={require('@/assets/images/food3.png')}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={[styles.mealTimeBadge, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="moon" size={12} color="#8b5cf6" />
              </View>
            </View>

            <View style={styles.mealCardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTypeName}>Dinner</Text>
                <Text style={styles.mealDishName} numberOfLines={1}>Lemon Salmon</Text>
              </View>
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
          onPress={() => Alert.alert('Grocery List', '18 items estimated at ₹420.')}
        >
          <View style={styles.groceryIconWrapper}>
            <MaterialCommunityIcons name="shopping" size={20} color={COLORS.iconColorGreen} />
          </View>

          <View style={styles.groceryCopy}>
            <Text style={styles.groceryTitle}>Grocery Preview</Text>
            <Text style={styles.grocerySubtitle}>18 items · ₹420 estimated</Text>
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
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Home */}
        <Pressable
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name="home"
            size={20}
            color={activeTab === 'home' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Home
          </Text>
        </Pressable>

        {/* Plans */}
        <Pressable
          style={[styles.navItem, activeTab === 'plans' && styles.navItemActive]}
          onPress={() => setActiveTab('plans')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === 'plans' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, activeTab === 'plans' && styles.navTextActive]}>
            Plans
          </Text>
        </Pressable>

        {/* Grocery */}
        <Pressable
          style={[styles.navItem, activeTab === 'grocery' && styles.navItemActive]}
          onPress={() => setActiveTab('grocery')}
        >
          <MaterialCommunityIcons
            name="shopping-outline"
            size={20}
            color={activeTab === 'grocery' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, activeTab === 'grocery' && styles.navTextActive]}>
            Grocery
          </Text>
        </Pressable>

        {/* Profile */}
        <Pressable
          style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={activeTab === 'profile' ? COLORS.brand : COLORS.label}
          />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
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
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.brand,
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#438e3b',
  },
  avatarImage: {
    width: 38,
    height: 38,
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
    fontSize: 13.5,
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
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    gap: 6,
  },
  calorieHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.heading,
  },
  calorieNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 8,
  },
  calorieCurrent: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2e7d32',
    letterSpacing: -0.5,
  },
  calorieTarget: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  progressBarTrack: {
    width: '90%',
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.progressTrack,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3.5,
    backgroundColor: COLORS.brand,
  },
  calorieRemaining: {
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.muted,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFDF9',
  },
  ringPercent: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.heading,
  },
  ringLabel: {
    fontSize: 10,
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
    paddingVertical: 10,
    gap: 6,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.label,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.heading,
    marginTop: 1,
  },
  statDetail: {
    fontSize: 9.5,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bannerBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.heading,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#4b5e4d',
    lineHeight: 16,
    marginTop: 4,
  },
  bannerGraphicWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  bannerSalad: {
    width: 68,
    height: 68,
  },
  bannerArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brand,
  },

  // Today's Meals 3-Grid
  mealsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  mealCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    height: 84,
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealTimeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  mealTypeName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.heading,
  },
  mealDishName: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 1,
  },
  checkCircleCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCirclePending: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingVertical: 11,
    marginBottom: 10,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  groceryIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  groceryCopy: {
    flex: 1,
  },
  groceryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.heading,
  },
  grocerySubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 1,
  },
  groceryRightItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groceryEmoji: {
    fontSize: 14,
  },
  groceryCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.iconBgGreen,
  },
  groceryCountText: {
    fontSize: 11,
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
