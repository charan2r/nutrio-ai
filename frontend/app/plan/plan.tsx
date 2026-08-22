import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
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
import { useRouter } from 'expo-router';

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
  chevron: '#9aa5b1',
};

type MealData = {
  type: string;
  name: string;
  calories: string;
  image: any;
  icon: string;
  iconColor: string;
  iconType: 'feather' | 'ionicons' | 'material';
};

const day1Meals: MealData[] = [
  {
    type: 'Breakfast',
    name: 'Berry Oats Bowl',
    calories: '420 kcal',
    image: require('@/assets/images/food1.png'),
    icon: 'sun',
    iconColor: '#f59e0b',
    iconType: 'feather',
  },
  {
    type: 'Lunch',
    name: 'Quinoa Power Bowl',
    calories: '620 kcal',
    image: require('@/assets/images/food2.png'),
    icon: 'sunny-outline',
    iconColor: '#f59e0b',
    iconType: 'ionicons',
  },
  {
    type: 'Dinner',
    name: 'Lemon Salmon',
    calories: '560 kcal',
    image: require('@/assets/images/food3.png'),
    icon: 'moon',
    iconColor: '#7c3aed',
    iconType: 'ionicons',
  },
  {
    type: 'Snack',
    name: 'Greek Yogurt & Nuts',
    calories: '220 kcal',
    image: require('@/assets/images/food4.png'),
    icon: 'leaf',
    iconColor: '#438e3b',
    iconType: 'material',
  },
];

const day2Meals: MealData[] = [
  {
    type: 'Breakfast',
    name: 'Berry Smoothie Bowl',
    calories: '380 kcal',
    image: require('@/assets/images/food5.png'),
    icon: 'sun',
    iconColor: '#f59e0b',
    iconType: 'feather',
  },
  {
    type: 'Lunch',
    name: 'Veggie Avocado Wrap',
    calories: '540 kcal',
    image: require('@/assets/images/food6.png'),
    icon: 'sunny-outline',
    iconColor: '#f59e0b',
    iconType: 'ionicons',
  },
  {
    type: 'Dinner',
    name: 'Herb Chicken Bowl',
    calories: '590 kcal',
    image: require('@/assets/images/food3.png'),
    icon: 'moon',
    iconColor: '#7c3aed',
    iconType: 'ionicons',
  },
  {
    type: 'Snack',
    name: 'Apple & Peanut Butter',
    calories: '190 kcal',
    image: require('@/assets/images/food4.png'),
    icon: 'leaf',
    iconColor: '#438e3b',
    iconType: 'material',
  },
];

export function NutrioPlan({ onBack }: { onBack?: () => void } = {}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string>('Day 1');

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  const handleSharePlan = async () => {
    try {
      await Share.share({
        message: 'Check out my 7-day personalized meal plan from Nutrio AI! 🌱',
      });
    } catch {
      Alert.alert('Share Plan', 'Meal plan link copied to clipboard.');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const renderMealIcon = (meal: MealData) => {
    if (meal.iconType === 'feather') {
      return <Feather name={meal.icon as any} size={11} color={meal.iconColor} />;
    }
    if (meal.iconType === 'ionicons') {
      return <Ionicons name={meal.icon as any} size={11} color={meal.iconColor} />;
    }
    return <MaterialCommunityIcons name={meal.icon as any} size={11} color={meal.iconColor} />;
  };

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
        {/* Top App Bar with Back, Logo & Share */}
        <View style={styles.topBar}>
          <View style={styles.topLeftGroup}>
            <Pressable style={styles.backButton} onPress={handleBack} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={COLORS.heading} />
            </Pressable>

            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <MaterialCommunityIcons name="leaf" size={20} color={COLORS.brand} />
              </View>
              <Text style={styles.brandName}>
                Nutrio <Text style={styles.brandNameAccent}>AI</Text>
              </Text>
            </View>
          </View>

          <Pressable style={styles.sharePill} onPress={handleSharePlan}>
            <Ionicons name="share-outline" size={15} color={COLORS.heading} />
            <Text style={styles.sharePillText}>Share Plan</Text>
          </Pressable>
        </View>

        {/* Hero Title */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Your 7-Day Meal Plan{' '}
            <MaterialCommunityIcons name="sprout" size={20} color={COLORS.brand} />
          </Text>
          <Text style={styles.heroSubtitle}>Generated on May 20, 2025</Text>
        </View>

        {/* AI Quality Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreNumber}>92</Text>
            <Text style={styles.scoreTotal}>/100</Text>
          </View>

          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>Excellent Plan!</Text>
            <Text style={styles.scoreDesc}>
              Great balance of nutrients, variety and calorie distribution.
            </Text>

            <View style={styles.scoreBadge}>
              <Ionicons name="sparkles" size={12} color="#2e7d32" />
              <Text style={styles.scoreBadgeText}>AI Quality Score</Text>
            </View>
          </View>
        </View>

        {/* 4 Metric Badges Row */}
        <View style={styles.metricRow}>
          {/* Meets Goals */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
              <Text style={styles.metricLabel}>Meets Goals</Text>
            </View>
            <Text style={styles.metricValue}>
              7/7 <Text style={styles.metricUnit}>days</Text>
            </Text>
          </View>

          {/* High Variety */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="leaf" size={13} color={COLORS.brand} />
              <Text style={styles.metricLabel}>High Variety</Text>
            </View>
            <Text style={styles.metricValue}>
              32+ <Text style={styles.metricUnit}>foods</Text>
            </Text>
          </View>

          {/* Balanced */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="scale-balance" size={13} color="#0ea5e9" />
              <Text style={styles.metricLabel}>Balanced</Text>
            </View>
            <Text style={styles.metricValue}>All macros</Text>
          </View>

          {/* High Fiber */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="leaf" size={13} color={COLORS.brand} />
              <Text style={styles.metricLabel}>High Fiber</Text>
            </View>
            <Text style={styles.metricValue}>
              28g <Text style={styles.metricUnit}>avg/day</Text>
            </Text>
          </View>
        </View>

        {/* Nutrition Strip / Summary Card */}
        <View style={styles.nutritionStripCard}>
          <View style={styles.nutritionColumnsRow}>
            {/* Est Budget */}
            <View style={styles.nutritionCol}>
              <View style={styles.nutritionLabelRow}>
                <MaterialCommunityIcons name="wallet-outline" size={12} color={COLORS.brand} />
                <Text style={styles.nutritionLabel}>Est. Budget</Text>
              </View>
              <Text style={styles.nutritionValue}>₹2,940</Text>
              <Text style={styles.nutritionSub}>of ₹3,000</Text>
            </View>

            {/* Calories */}
            <View style={styles.nutritionCol}>
              <View style={styles.nutritionLabelRow}>
                <MaterialCommunityIcons name="fire" size={12} color="#f97316" />
                <Text style={styles.nutritionLabel}>Calories <Text style={{ fontSize: 8.5 }}>(avg)</Text></Text>
              </View>
              <Text style={styles.nutritionValue}>1,842</Text>
              <Text style={styles.nutritionSub}>kcal/day</Text>
            </View>

            {/* Protein */}
            <View style={styles.nutritionCol}>
              <View style={styles.nutritionLabelRow}>
                <MaterialCommunityIcons name="arm-flex" size={12} color={COLORS.brand} />
                <Text style={styles.nutritionLabel}>Protein <Text style={{ fontSize: 8.5 }}>(avg)</Text></Text>
              </View>
              <Text style={styles.nutritionValue}>92g</Text>
              <Text style={styles.nutritionSub}>21% kcal</Text>
            </View>

            {/* Carbs */}
            <View style={styles.nutritionCol}>
              <View style={styles.nutritionLabelRow}>
                <MaterialCommunityIcons name="barley" size={12} color="#eab308" />
                <Text style={styles.nutritionLabel}>Carbs <Text style={{ fontSize: 8.5 }}>(avg)</Text></Text>
              </View>
              <Text style={styles.nutritionValue}>208g</Text>
              <Text style={styles.nutritionSub}>45% kcal</Text>
            </View>

            {/* Fats */}
            <View style={styles.nutritionCol}>
              <View style={styles.nutritionLabelRow}>
                <MaterialCommunityIcons name="water" size={12} color="#0ea5e9" />
                <Text style={styles.nutritionLabel}>Fats <Text style={{ fontSize: 8.5 }}>(avg)</Text></Text>
              </View>
              <Text style={styles.nutritionValue}>64g</Text>
              <Text style={styles.nutritionSub}>34% kcal</Text>
            </View>
          </View>

          {/* Color accent bars at bottom of strip */}
          <View style={styles.stripBarWrapper}>
            <View style={[styles.stripBarSegment, { backgroundColor: '#438e3b', flex: 1 }]} />
            <View style={[styles.stripBarSegment, { backgroundColor: '#0d9488', flex: 1.2 }]} />
            <View style={[styles.stripBarSegment, { backgroundColor: '#0284c7', flex: 1 }]} />
            <View style={[styles.stripBarSegment, { backgroundColor: '#eab308', flex: 1.8 }]} />
            <View style={[styles.stripBarSegment, { backgroundColor: '#38bdf8', flex: 1.2 }]} />
          </View>
        </View>

        {/* Day Selector Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayTabsScroll}
          contentContainerStyle={styles.dayTabsContainer}
        >
          {days.map((d) => {
            const isActive = selectedDay === d;
            return (
              <Pressable
                key={d}
                style={[styles.dayTabPill, isActive && styles.dayTabPillActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Day 1 Section */}
        <View style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <Text style={styles.daySectionTitle}>
              Day 1 <Text style={styles.daySectionKcal}>• 2,020 kcal</Text>
            </Text>
            <View style={styles.goalsMetBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
              <Text style={styles.goalsMetText}>Goals met</Text>
            </View>
          </View>

          {/* 4 Meal Cards Grid */}
          <View style={styles.mealCardsGrid}>
            {day1Meals.map((meal) => (
              <Pressable
                key={meal.type}
                style={({ pressed }) => [styles.mealCard, pressed && { opacity: 0.9 }]}
                onPress={() => Alert.alert(meal.name, `${meal.type} · ${meal.calories}\nDelicious nutrient-rich recipe.`)}
              >
                <View style={styles.mealCardTypeHeader}>
                  {renderMealIcon(meal)}
                  <Text style={styles.mealCardType}>{meal.type}</Text>
                </View>

                <View style={styles.mealCardImageContainer}>
                  <Image source={meal.image} style={styles.mealCardImage} resizeMode="cover" />
                </View>

                <Text style={styles.mealCardName} numberOfLines={2}>
                  {meal.name}
                </Text>
                <Text style={styles.mealCardKcal}>{meal.calories}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Day 2 Section */}
        <View style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <Text style={styles.daySectionTitle}>
              Day 2 <Text style={styles.daySectionKcal}>• 1,890 kcal</Text>
            </Text>
            <View style={styles.goalsMetBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
              <Text style={styles.goalsMetText}>Goals met</Text>
            </View>
          </View>

          {/* 4 Meal Cards Grid */}
          <View style={styles.mealCardsGrid}>
            {day2Meals.map((meal) => (
              <Pressable
                key={meal.type}
                style={({ pressed }) => [styles.mealCard, pressed && { opacity: 0.9 }]}
                onPress={() => Alert.alert(meal.name, `${meal.type} · ${meal.calories}\nNutritious balanced meal.`)}
              >
                <View style={styles.mealCardTypeHeader}>
                  {renderMealIcon(meal)}
                  <Text style={styles.mealCardType}>{meal.type}</Text>
                </View>

                <View style={styles.mealCardImageContainer}>
                  <Image source={meal.image} style={styles.mealCardImage} resizeMode="cover" />
                </View>

                <Text style={styles.mealCardName} numberOfLines={2}>
                  {meal.name}
                </Text>
                <Text style={styles.mealCardKcal}>{meal.calories}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bottom Floating Action Buttons */}
        <View style={styles.bottomActionsRow}>
          {/* Plan Actions */}
          <Pressable
            style={({ pressed }) => [styles.planActionsBtn, pressed && { opacity: 0.85 }]}
            onPress={() => Alert.alert('Plan Actions', 'Export PDF, add items to grocery list, or regenerate meals.')}
          >
            <MaterialCommunityIcons name="tune-variant" size={17} color={COLORS.heading} />
            <Text style={styles.planActionsBtnText}>Plan Actions</Text>
          </Pressable>

          {/* Adjust Plan */}
          <Pressable
            style={({ pressed }) => [styles.adjustPlanBtn, pressed && { opacity: 0.9 }]}
            onPress={() => Alert.alert('Adjust Plan', 'Swap meals or adjust calorie targets for this week.')}
          >
            <Feather name="edit-2" size={15} color="#FFFFFF" />
            <Text style={styles.adjustPlanBtnText}>Adjust Plan</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    width: 170,
    height: 150,
    right: -35,
    top: -15,
    borderRadius: 85,
    backgroundColor: '#EDF6E8',
    opacity: 0.55,
  },
  bgBlobBottomLeft: {
    position: 'absolute',
    width: 130,
    height: 130,
    left: -35,
    bottom: 20,
    borderRadius: 65,
    backgroundColor: '#EDF6E8',
    opacity: 0.4,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.4,
  },
  brandNameAccent: {
    color: COLORS.brand,
    fontWeight: '900',
  },
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sharePillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.heading,
  },

  // Hero Section
  heroSection: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.heading,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2,
  },

  // AI Quality Score Card
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    marginBottom: 12,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scoreRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5.5,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFDF9',
  },
  scoreNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.5,
  },
  scoreTotal: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: -2,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.heading,
  },
  scoreDesc: {
    fontSize: 11.5,
    color: COLORS.muted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 6,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.iconBgGreen,
  },
  scoreBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2e7d32',
  },

  // 4 Metric Badges Row
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.label,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.heading,
  },
  metricUnit: {
    fontSize: 9.5,
    fontWeight: '500',
    color: COLORS.muted,
  },

  // Nutrition Strip Card
  nutritionStripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingTop: 12,
    paddingBottom: 0,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  nutritionColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  nutritionCol: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.label,
  },
  nutritionValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.heading,
  },
  nutritionSub: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 1,
  },
  stripBarWrapper: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
  },
  stripBarSegment: {
    height: 4,
  },

  // Day Selector Tabs
  dayTabsScroll: {
    marginBottom: 12,
  },
  dayTabsContainer: {
    gap: 7,
    paddingRight: 10,
  },
  dayTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dayTabPillActive: {
    backgroundColor: COLORS.brandButton,
    borderColor: COLORS.brandButton,
  },
  dayTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.heading,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Day Section
  daySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  daySectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.heading,
  },
  daySectionKcal: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },
  goalsMetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalsMetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#22c55e',
  },

  // 4 Meal Cards Grid
  mealCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  mealCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    padding: 5,
    alignItems: 'center',
  },
  mealCardTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  mealCardType: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.heading,
  },
  mealCardImageContainer: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
  },
  mealCardImage: {
    width: '100%',
    height: '100%',
  },
  mealCardName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.heading,
    textAlign: 'center',
    lineHeight: 12,
    minHeight: 24,
  },
  mealCardKcal: {
    fontSize: 8.5,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Bottom Actions
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  planActionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  planActionsBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.heading,
  },
  adjustPlanBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.brandButton,
    shadowColor: COLORS.brandButton,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  adjustPlanBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NutrioPlan;
