import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';

const COLORS = {
  brand: '#438e3b',
  brandDark: '#285d2b',
  brandButton: '#589b4b',
  brandActive: '#2e6b35',
  screenBg: '#f7faf5',
  cardBg: '#ffffff',
  cardBorder: '#e2ece0',
  heading: '#18202a',
  muted: '#7c8ba0',
  label: '#7c8490',
  iconBgGreen: '#edf6e5',
  iconColorGreen: '#438e3b',
  progressTrack: '#e8efe6',
  chevron: '#9aa5b1',
  tagBg: '#f3f4f6',
};

type GroceryItem = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  price: number;
  category: 'Grains' | 'Vegetables' | 'Protein' | 'Fruits';
  emoji?: string;
  image?: any;
  purchased: boolean;
};

const initialGroceryItems: GroceryItem[] = [
  // Grains
  {
    id: '1',
    name: 'Rolled Oats',
    amount: '500',
    unit: 'g',
    price: 45,
    category: 'Grains',
    image: require('@/assets/images/food1.png'),
    purchased: true,
  },
  {
    id: '2',
    name: 'Quinoa',
    amount: '250',
    unit: 'g',
    price: 35,
    category: 'Grains',
    image: require('@/assets/images/food2.png'),
    purchased: false,
  },
  // Vegetables
  {
    id: '3',
    name: 'Spinach',
    amount: '250',
    unit: 'g',
    price: 25,
    category: 'Vegetables',
    emoji: '🥬',
    purchased: true,
  },
  {
    id: '4',
    name: 'Broccoli',
    amount: '1',
    unit: 'head',
    price: 35,
    category: 'Vegetables',
    emoji: '🥦',
    purchased: false,
  },
  {
    id: '5',
    name: 'Bell Peppers',
    amount: '2',
    unit: 'pcs',
    price: 30,
    category: 'Vegetables',
    emoji: '🫑',
    purchased: false,
  },
  // Protein
  {
    id: '6',
    name: 'Chicken Breast',
    amount: '500',
    unit: 'g',
    price: 120,
    category: 'Protein',
    emoji: '🍗',
    purchased: false,
  },
  {
    id: '7',
    name: 'Tofu',
    amount: '200',
    unit: 'g',
    price: 40,
    category: 'Protein',
    emoji: '🧊',
    purchased: true,
  },
  // Fruits
  {
    id: '8',
    name: 'Bananas',
    amount: '4',
    unit: 'pcs',
    price: 20,
    category: 'Fruits',
    emoji: '🍌',
    purchased: false,
  },
];

export function NutrioGrocery({
  mealPlanId,
  onBack,
}: {
  mealPlanId?: string;
  onBack?: () => void;
} = {}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [items, setItems] = useState<GroceryItem[]>(initialGroceryItems);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'tobuy' | 'purchased'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load grocery list from backend
  useEffect(() => {
    async function loadGroceryList() {
      try {
        let planIdToUse = mealPlanId;
        if (!planIdToUse) {
          const plansRes = await apiClient.get('/meal-plans');
          if (Array.isArray(plansRes.data) && plansRes.data.length > 0) {
            planIdToUse = plansRes.data[0].id;
          }
        }

        if (planIdToUse) {
          setIsLoading(true);
          const res = await apiClient.get(`/grocery-list/plan/${planIdToUse}`);
          if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
            const mapped: GroceryItem[] = res.data.items.map((it: any, index: number) => {
              let category: 'Grains' | 'Vegetables' | 'Protein' | 'Fruits' = 'Vegetables';
              const catLower = (it.category || '').toLowerCase();
              if (catLower.includes('grain') || catLower.includes('bakery')) category = 'Grains';
              else if (catLower.includes('protein') || catLower.includes('meat') || catLower.includes('fish')) category = 'Protein';
              else if (catLower.includes('fruit')) category = 'Fruits';

              return {
                id: String(index + 1),
                name: it.ingredientName || it.name || 'Ingredient',
                amount: String(it.quantity || 1),
                unit: it.unit || 'g',
                price: Number(it.estimatedCostLkr || 30),
                category: category,
                emoji: getEmojiForCategory(category),
                purchased: Boolean(it.purchased),
              };
            });
            setItems(mapped);
          }
        }
      } catch (err) {
        console.log('Error loading grocery list from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGroceryList();
  }, [mealPlanId]);

  const getEmojiForCategory = (cat: string) => {
    switch (cat) {
      case 'Grains':
        return '🥣';
      case 'Protein':
        return '🍗';
      case 'Fruits':
        return '🍌';
      default:
        return '🥬';
    }
  };

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const markAllPurchased = () => {
    setItems((prev) => prev.map((item) => ({ ...item, purchased: true })));
    Alert.alert('Grocery List', 'All items marked as purchased! 🎉');
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const totalItemsCount = items.length;
  const purchasedCount = items.filter((i) => i.purchased).length;
  const toBuyCount = totalItemsCount - purchasedCount;
  const totalCost = items.reduce((sum, item) => sum + item.price, 0);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === 'tobuy') return !item.purchased;
      if (activeFilter === 'purchased') return item.purchased;
      return true;
    });
  }, [items, searchQuery, activeFilter]);

  const categories: ('Grains' | 'Vegetables' | 'Protein' | 'Fruits')[] = [
    'Grains',
    'Vegetables',
    'Protein',
    'Fruits',
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'Grains') {
      return <MaterialCommunityIcons name="barley" size={17} color={COLORS.brand} />;
    }
    if (cat === 'Vegetables') {
      return <MaterialCommunityIcons name="food-apple-outline" size={17} color={COLORS.brand} />;
    }
    if (cat === 'Protein') {
      return <MaterialCommunityIcons name="arm-flex" size={17} color={COLORS.brand} />;
    }
    return <MaterialCommunityIcons name="fruit-cherries" size={17} color={COLORS.brand} />;
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
        {/* Top App Bar with Back, Logo & Avatar */}
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.heading} />
          </Pressable>

          <View style={styles.brandMark}>
            <MaterialCommunityIcons name="leaf" size={22} color={COLORS.brand} />
          </View>

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

        {/* Heading & Subtitle */}
        <View style={styles.headingSection}>
          <Text style={styles.headingTitle}>Grocery List</Text>
          <Text style={styles.headingSubtitle}>
            Everything you need for healthy meals{' '}
            <MaterialCommunityIcons name="leaf" size={15} color={COLORS.brand} />
          </Text>
        </View>

        {/* Total Estimated Cost Card */}
        <View style={styles.costCard}>
          <View style={styles.bagIconWrapper}>
            <MaterialCommunityIcons name="shopping" size={24} color={COLORS.brand} />
          </View>

          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Total Estimated Cost</Text>
            <View style={styles.costPriceRow}>
              <Text style={styles.costPrice}>₹{totalCost}</Text>
              <Text style={styles.costBudget}> of ₹700 budget</Text>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalCost / 700) * 100)}%` }]} />
            </View>
          </View>

          {/* Cart Items Pill */}
          <View style={styles.cartItemsBadge}>
            <Ionicons name="cart-outline" size={17} color="#2e7d32" />
            <Text style={styles.cartItemsCount}>{totalItemsCount}</Text>
            <Text style={styles.cartItemsLabel}>items</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#9aa5b1" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#9aa5b1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#9aa5b1" />
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterRow}>
          {/* All Items */}
          <Pressable
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
              All Items
            </Text>
            <View style={[styles.filterCountBubble, activeFilter === 'all' && styles.filterCountBubbleActive]}>
              <Text style={[styles.filterCountText, activeFilter === 'all' && styles.filterCountTextActive]}>
                {totalItemsCount}
              </Text>
            </View>
          </Pressable>

          {/* To Buy */}
          <Pressable
            style={[styles.filterPill, activeFilter === 'tobuy' && styles.filterPillActive]}
            onPress={() => setActiveFilter('tobuy')}
          >
            <Text style={[styles.filterText, activeFilter === 'tobuy' && styles.filterTextActive]}>
              To Buy
            </Text>
            <View style={[styles.filterCountBubble, activeFilter === 'tobuy' && styles.filterCountBubbleActive]}>
              <Text style={[styles.filterCountText, activeFilter === 'tobuy' && styles.filterCountTextActive]}>
                {toBuyCount}
              </Text>
            </View>
          </Pressable>

          {/* Purchased */}
          <Pressable
            style={[styles.filterPill, activeFilter === 'purchased' && styles.filterPillActive]}
            onPress={() => setActiveFilter('purchased')}
          >
            <Text style={[styles.filterText, activeFilter === 'purchased' && styles.filterTextActive]}>
              Purchased
            </Text>
            <View style={[styles.filterCountBubble, activeFilter === 'purchased' && styles.filterCountBubbleActive]}>
              <Text style={[styles.filterCountText, activeFilter === 'purchased' && styles.filterCountTextActive]}>
                {purchasedCount}
              </Text>
            </View>
          </Pressable>

          {/* Filters Button */}
          <Pressable
            style={styles.filtersBtn}
            onPress={() => Alert.alert('Filters', 'Sort by aisle, price, or meal.')}
          >
            <MaterialCommunityIcons name="tune-variant" size={15} color={COLORS.heading} />
            <Text style={styles.filtersBtnText}>Filters</Text>
          </Pressable>
        </View>

        {/* Grouped Category Sections */}
        {categories.map((cat) => {
          const categoryItems = filteredItems.filter((i) => i.category === cat);
          if (categoryItems.length === 0) return null;

          const isCollapsed = collapsedCategories[cat];
          const catTotalCost = categoryItems.reduce((s, i) => s + i.price, 0);

          return (
            <View style={styles.categoryCard} key={cat}>
              {/* Category Header */}
              <Pressable
                style={styles.categoryHeader}
                onPress={() => toggleCategory(cat)}
              >
                <View style={styles.categoryIconCircle}>
                  {getCategoryIcon(cat)}
                </View>
                <Text style={styles.categoryTitle}>{cat}</Text>
                <Text style={styles.categoryMeta}>
                  {categoryItems.length} items • ₹{catTotalCost}
                </Text>
                <Ionicons
                  name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                  size={16}
                  color={COLORS.chevron}
                  style={{ marginLeft: 6 }}
                />
              </Pressable>

              {/* Items List */}
              {!isCollapsed && (
                <View style={styles.categoryItemsList}>
                  {categoryItems.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.itemRow,
                        index === categoryItems.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => togglePurchased(item.id)}
                    >
                      {/* Left Item Graphic / Image */}
                      <View style={styles.itemImageContainer}>
                        {item.image ? (
                          <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.itemEmoji}>{item.emoji || '🥗'}</Text>
                        )}
                      </View>

                      {/* Middle Details */}
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.amountBadgeRow}>
                          <View style={styles.amountBadge}>
                            <Text style={styles.amountText}>{item.amount}</Text>
                          </View>
                          <View style={[styles.amountBadge, { backgroundColor: 'transparent' }]}>
                            <Text style={styles.unitText}>{item.unit}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Price & Checkbox */}
                      <Text style={styles.itemPrice}>₹{item.price}</Text>

                      <View
                        style={[
                          styles.checkbox,
                          item.purchased && styles.checkboxChecked,
                        ]}
                      >
                        {item.purchased && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Mark All as Purchased Button */}
        <Pressable
          style={({ pressed }) => [
            styles.markAllButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={markAllPurchased}
        >
          <MaterialCommunityIcons name="playlist-check" size={20} color="#FFFFFF" />
          <Text style={styles.markAllButtonText}>Mark All as Purchased</Text>
        </Pressable>
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
    marginBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Heading Section
  headingSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 3,
  },

  // Cost Card
  costCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  bagIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  costPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: 6,
  },
  costPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2e7d32',
    letterSpacing: -0.4,
  },
  costBudget: {
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.muted,
  },
  progressBarTrack: {
    width: 140,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.progressTrack,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.brand,
  },
  cartItemsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.iconBgGreen,
    width: 60,
    height: 60,
    borderRadius: 30,
    paddingVertical: 4,
  },
  cartItemsCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2e7d32',
    marginTop: -1,
  },
  cartItemsLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2e7d32',
    marginTop: -2,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.heading,
    paddingVertical: 0,
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterPillActive: {
    backgroundColor: COLORS.brandActive,
    borderColor: COLORS.brandActive,
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.heading,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterCountBubble: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterCountBubbleActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginLeft: 'auto',
  },
  filtersBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.heading,
  },

  // Category Cards
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    marginBottom: 10,
    shadowColor: '#1a3319',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.iconBgGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.heading,
    flex: 1,
  },
  categoryMeta: {
    fontSize: 11.5,
    color: COLORS.muted,
    fontWeight: '500',
  },
  categoryItemsList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5ef',
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f7faf5',
  },
  itemImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.heading,
  },
  amountBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  amountBadge: {
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  amountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  unitText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.muted,
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#2e7d32',
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },

  // Bottom Mark All Button
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.brandButton,
    marginTop: 6,
    marginBottom: 8,
    shadowColor: COLORS.brandButton,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  markAllButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NutrioGrocery;
