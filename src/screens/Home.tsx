
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GOLD = '#D6AD62';
const GOLD_LIGHT = '#F0D8A5';
const BACKGROUND = '#08090B';
const SURFACE = '#141619';
const MUTED = '#92949A';

const CARD_WIDTH = width - 40;

type Car = {
  id: string;
  name: string;
  price_per_day: string;
  image_url: string;
  rating: string;
  seats: number;
  transmission: string;
  theme_color: string;
  category: string;
};

const CATEGORIES = [
  { label: 'All', icon: 'grid-outline' },
  { label: 'Luxury', icon: 'diamond-outline' },
  { label: 'SUV', icon: 'car-sport-outline' },
  { label: 'Sedan', icon: 'car-outline' },
  { label: 'Sports', icon: 'speedometer-outline' },
];

export default function HomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState('Driver');
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchCars();
  }, []);

  // USER AUTHENTICATION AND ADMIN CHECK
  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0]);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.is_admin === true);
      }
    } catch (error) {
      console.log('User data error:', error);
    }
  };

  // FETCH CARS FROM SUPABASE
  const fetchCars = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching cars:', error);
      } else if (data) {
        setCars(data as Car[]);
      }
    } catch (error) {
      console.log('Cars error:', error);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH AND CATEGORY FILTERING
  const filteredCars = cars.filter((car) => {
    const name = (car.name || '').toLowerCase();
    const category = (car.category || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = name.includes(search);

    const matchesCategory =
      activeCategory === 'All' ||
      category === activeCategory.toLowerCase() ||
      name.includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // CAROUSEL PAGINATION
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  // PRICE FORMAT
  const formatPrice = (price: string | number) => {
    return Number(price || 0).toLocaleString('en-KE');
  };

  // NAVIGATION
  const openCar = (id: string) => {
    router.push({
      pathname: '/car-details',
      params: { id },
    });
  };

  // SHARE CAR
  const shareCar = async (car: Car) => {
    try {
      await Share.share({
        message: `Check out ${car.name} available for hire at KES ${formatPrice(car.price_per_day)} per day.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BACKGROUND}
      />

      {/* BACKGROUND */}
      <LinearGradient
        colors={['#17130E', '#090A0C', '#050505']}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.brandSection}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="car-sport"
                  size={25}
                  color={GOLD}
                />
              </View>

              <View style={styles.brandTextContainer}>
                <Text
                  style={styles.brandName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  PREMIUM DRIVE
                </Text>

                <Text
                  style={styles.brandCaption}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  RENT • DRIVE • EXPLORE
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push('/admin')}
                  >
                    <Ionicons
                      name="add-outline"
                      size={23}
                      color={GOLD}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push('/admin-bookings')}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color={GOLD}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push('/admin-analytics')}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={20}
                      color={GOLD}
                    />
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Ionicons
                  name="person-outline"
                  size={21}
                  color={GOLD_LIGHT}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* WELCOME SECTION */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeEyebrow}>
              YOUR NEXT JOURNEY STARTS HERE
            </Text>

            <Text style={styles.greeting}>
              Welcome back,
            </Text>

            <Text style={styles.userName}>
              {userName}
              <Text style={styles.goldPeriod}>.</Text>
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Discover the perfect car for every occasion.
            </Text>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={22}
              color={GOLD}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search BMW, Mercedes, Audi..."
              placeholderTextColor="#858585"
              value={searchQuery}
              onChangeText={(value) => {
                setSearchQuery(value);
                setActiveIndex(0);
              }}
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setActiveIndex(0);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color={MUTED}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* CATEGORY SELECTORS */}
          <View style={styles.categorySection}>
            <Text style={styles.smallHeading}>
              EXPLORE CATEGORIES
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.map((category) => {
                const selected = activeCategory === category.label;

                return (
                  <TouchableOpacity
                    key={category.label}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveCategory(category.label);
                      setActiveIndex(0);
                    }}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonActive,
                    ]}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={17}
                      color={selected ? '#17120A' : GOLD}
                    />

                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* FEATURED CARS HEADER */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                EXCLUSIVE COLLECTION
              </Text>

              <Text style={styles.sectionTitle}>
                Featured Cars
              </Text>
            </View>

            <View style={styles.premiumBadge}>
              <Ionicons
                name="diamond"
                size={12}
                color={GOLD}
              />

              <Text style={styles.premiumText}>
                PREMIUM
              </Text>
            </View>
          </View>

          {/* FEATURED CARS */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={GOLD}
              />

              <Text style={styles.loadingText}>
                Finding your perfect ride...
              </Text>
            </View>
          ) : filteredCars.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="car-outline"
                size={52}
                color={GOLD}
              />

              <Text style={styles.emptyTitle}>
                No cars found
              </Text>

              <Text style={styles.emptyText}>
                Try searching for another car or category.
              </Text>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveIndex(0);
                }}
              >
                <Text style={styles.clearButtonText}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={filteredCars}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.carouselContent}
                snapToInterval={CARD_WIDTH + 14}
                decelerationRate="fast"
                disableIntervalMomentum
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item: car }) => (
                  <View style={styles.heroCard}>
                    {/* FULL CAR IMAGE */}
                    <View style={styles.imageContainer}>
                      {car.image_url ? (
                        <Image
                          source={{ uri: car.image_url }}
                          style={styles.heroImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons
                            name="car-sport"
                            size={65}
                            color={GOLD}
                          />

                          <Text style={styles.placeholderText}>
                            Vehicle image unavailable
                          </Text>
                        </View>
                      )}

                      {/* SUBTLE IMAGE GRADIENT */}
                      <LinearGradient
                        colors={[
                          'rgba(0,0,0,0.02)',
                          'rgba(0,0,0,0.10)',
                          'rgba(0,0,0,0.80)',
                        ]}
                        locations={[0, 0.55, 1]}
                        style={styles.imageGradient}
                        pointerEvents="none"
                      />

                      {/* TOP BADGE */}
                      <View style={styles.imageTopRow}>
                        <View style={styles.carTypeBadge}>
                          <Ionicons
                            name="diamond"
                            size={13}
                            color="#15110A"
                          />

                          <Text style={styles.carTypeText}>
                            {car.category || 'PREMIUM'}
                          </Text>
                        </View>
                      </View>

                      {/* RATING */}
                      <View style={styles.ratingBadge}>
                        <Ionicons
                          name="star"
                          size={13}
                          color={GOLD}
                        />

                        <Text style={styles.ratingText}>
                          {car.rating || 'New'}
                        </Text>
                      </View>

                      {/* IMAGE TITLE */}
                      <View style={styles.imageBottomContent}>
                        <Text style={styles.imageEyebrow}>
                          EXPERIENCE EXCELLENCE
                        </Text>

                        <Text
                          style={styles.imageCarName}
                          numberOfLines={1}
                        >
                          {car.name}
                        </Text>

                        <Text style={styles.imageDescription}>
                          Luxury. Comfort. Performance.
                        </Text>
                      </View>

                      {/* SHARE ACTION */}
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => shareCar(car)}
                      >
                        <Ionicons
                          name="share-social-outline"
                          size={19}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* CAR INFORMATION */}
                    <View style={styles.carInfo}>
                      <View style={styles.specifications}>
                        <View style={styles.specItem}>
                          <Ionicons
                            name="people-outline"
                            size={17}
                            color={GOLD}
                          />

                          <Text style={styles.specText}>
                            {car.seats || '—'} Seats
                          </Text>
                        </View>

                        <View style={styles.specDivider} />

                        <View style={styles.specItem}>
                          <Ionicons
                            name="settings-outline"
                            size={17}
                            color={GOLD}
                          />

                          <Text style={styles.specText}>
                            {car.transmission || '—'}
                          </Text>
                        </View>

                        <View style={styles.specDivider} />

                        <View style={styles.specItem}>
                          <Ionicons
                            name="car-outline"
                            size={17}
                            color={GOLD}
                          />

                          <Text
                            style={styles.specText}
                            numberOfLines={1}
                          >
                            {car.category || 'Luxury'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.carInfoDivider} />

                      {/* PRICE AND BUTTON */}
                      <View style={styles.priceActionRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>
                            STARTING FROM
                          </Text>

                          <View style={styles.priceLine}>
                            <Text style={styles.currency}>
                              KES
                            </Text>

                            <Text style={styles.price}>
                              {formatPrice(car.price_per_day)}
                            </Text>
                          </View>

                          <Text style={styles.priceUnit}>
                            PER DAY
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[
                            styles.bookButton,
                            {
                              backgroundColor: car.theme_color || GOLD,
                            },
                          ]}
                          onPress={() => openCar(car.id)}
                        >
                          <Text style={styles.bookButtonText}>
                            Hire This Car
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={17}
                            color="#17120A"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />

              {/* PAGINATION */}
              <View style={styles.paginationContainer}>
                <View style={styles.paginationGlass}>
                  {filteredCars.map((car, index) => (
                    <View
                      key={car.id}
                      style={[
                        styles.paginationDot,
                        activeIndex === index &&
                          styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>

                <Text style={styles.paginationCount}>
                  {String(activeIndex + 1).padStart(2, '0')}
                  {' / '}
                  {String(filteredCars.length).padStart(2, '0')}
                </Text>
              </View>
            </>
          )}

          {/* RECOMMENDED CARS */}
          {!loading && filteredCars.length > 0 && (
            <>
              <View style={styles.recommendedHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    HANDPICKED FOR YOU
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Recommended Cars
                  </Text>
                </View>

                <Text style={styles.recommendedCount}>
                  {filteredCars.length} CARS
                </Text>
              </View>

              <FlatList
                data={filteredCars.slice(0, 6)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `rec-${item.id}`}
                contentContainerStyle={styles.recommendedList}
                renderItem={({ item: car }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.recCard}
                    onPress={() => openCar(car.id)}
                  >
                    <View style={styles.recImageContainer}>
                      {car.image_url ? (
                        <Image
                          source={{ uri: car.image_url }}
                          style={styles.recImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.recImagePlaceholder}>
                          <Ionicons
                            name="car-sport-outline"
                            size={35}
                            color={GOLD}
                          />
                        </View>
                      )}

                      <View style={styles.recRating}>
                        <Ionicons
                          name="star"
                          size={11}
                          color={GOLD}
                        />

                        <Text style={styles.recRatingText}>
                          {car.rating || 'New'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.recInfo}>
                      <Text style={styles.recCategory}>
                        {car.category || 'PREMIUM'}
                      </Text>

                      <Text
                        style={styles.recName}
                        numberOfLines={1}
                      >
                        {car.name}
                      </Text>

                      <View style={styles.recPriceRow}>
                        <Text style={styles.recPrice}>
                          KES {formatPrice(car.price_per_day)}
                        </Text>

                        <Text style={styles.recPriceSub}>
                          / day
                        </Text>
                      </View>

                      <View style={styles.recFooter}>
                        <Text style={styles.recExplore}>
                          Explore car
                        </Text>

                        <Ionicons
                          name="arrow-forward-circle"
                          size={23}
                          color={GOLD}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* SELF DRIVE / CHAUFFEUR PROMOTION */}
          <View style={styles.experienceBanner}>
            <LinearGradient
              colors={['#302718', '#17130E', '#0D0D0D']}
              style={styles.experienceGradient}
            >
              <View style={styles.experienceContent}>
                <Text style={styles.experienceEyebrow}>
                  PREMIUM EXPERIENCE
                </Text>

                <Text style={styles.experienceTitle}>
                  More than just
                </Text>

                <Text style={styles.experienceGoldTitle}>
                  a journey.
                </Text>

                <Text style={styles.experienceDescription}>
                  Choose self-drive freedom or enjoy
                  the comfort of a professional chauffeur.
                </Text>

                <View style={styles.experienceServices}>
                  <View style={styles.experienceService}>
                    <Ionicons
                      name="car-outline"
                      size={16}
                      color={GOLD}
                    />

                    <Text style={styles.experienceServiceText}>
                      SELF-DRIVE
                    </Text>
                  </View>

                  <View style={styles.experienceService}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={GOLD}
                    />

                    <Text style={styles.experienceServiceText}>
                      CHAUFFEUR
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.bannerDecoration}>
                <Ionicons
                  name="car-sport"
                  size={100}
                  color="rgba(214,173,98,0.18)"
                />
              </View>
            </LinearGradient>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Text style={styles.footerBrand}>
              PREMIUM CAR HIRE
            </Text>

            <Text style={styles.footerText}>
              DRIVE IN STYLE. ARRIVE IN CLASS.
            </Text>
          </View>

          <View style={{ height: 35 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // HEADER
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },

  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  brandTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  brandIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.45)',
    backgroundColor: 'rgba(214,173,98,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    color: GOLD_LIGHT,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    flexShrink: 1,
  },

  brandCaption: {
    color: MUTED,
    fontSize: 7,
    letterSpacing: 1.05,
    marginTop: 5,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },

  headerButton: {
    width: 30,
    height: 34,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.25)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButton: {
    width: 36,
    height: 38,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(214,173,98,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // WELCOME
  welcomeSection: {
    paddingHorizontal: 22,
    marginTop: 5,
    marginBottom: 19,
  },

  welcomeEyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 12,
  },

  greeting: {
    color: '#B9B9B9',
    fontSize: 16,
    fontWeight: '500',
  },

  userName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 1,
  },

  goldPeriod: {
    color: GOLD,
  },

  welcomeSubtitle: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 7,
  },

  // SEARCH
  searchContainer: {
    marginHorizontal: 20,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.40)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },

  // CATEGORIES
  categorySection: {
    marginTop: 22,
    marginBottom: 22,
  },

  smallHeading: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginLeft: 21,
    marginBottom: 13,
  },

  categoryList: {
    paddingHorizontal: 20,
    gap: 9,
  },

  categoryButton: {
    height: 43,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#17191C',
    borderWidth: 1,
    borderColor: '#303033',
  },

  categoryButtonActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },

  categoryText: {
    color: '#C1C1C1',
    fontSize: 12,
    fontWeight: '600',
  },

  categoryTextActive: {
    color: '#17120A',
    fontWeight: '800',
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 21,
    marginBottom: 16,
  },

  sectionEyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.35)',
    backgroundColor: 'rgba(214,173,98,0.09)',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  premiumText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // LOADING AND EMPTY
  loadingContainer: {
    minHeight: 280,
    paddingVertical: 35,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
  },

  emptyContainer: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    gap: 12,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  emptyText: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  clearButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 23,
    paddingVertical: 11,
    marginTop: 5,
  },

  clearButtonText: {
    color: '#17120A',
    fontWeight: '800',
    fontSize: 12,
  },

  // FEATURED CAROUSEL
  carouselContent: {
    paddingHorizontal: 20,
    gap: 14,
  },

  heroCard: {
    width: CARD_WIDTH,
    flexShrink: 0,
    backgroundColor: '#111315',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.38)',
    overflow: 'hidden',
  },

  // IMPORTANT: LARGE IMAGE AREA TO SHOW THE ENTIRE CAR
  imageContainer: {
    width: '100%',
    height: 310,
    backgroundColor: '#0B0D0F',
    position: 'relative',
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17191C',
    gap: 12,
  },

  placeholderText: {
    color: MUTED,
    fontSize: 11,
  },

  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  imageTopRow: {
    position: 'absolute',
    top: 15,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  carTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: GOLD,
  },

  carTypeText: {
    color: '#17120A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  ratingBadge: {
    position: 'absolute',
    top: 63,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },

  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  imageBottomContent: {
    position: 'absolute',
    left: 16,
    right: 58,
    bottom: 16,
  },

  imageEyebrow: {
    color: GOLD_LIGHT,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 7,
  },

  imageCarName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  imageDescription: {
    color: '#D0D0D0',
    fontSize: 12,
    marginTop: 5,
  },

  shareButton: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 34,
    height: 34,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CAR INFORMATION
  carInfo: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },

  specifications: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },

  specText: {
    color: '#C5C5C5',
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },

  specDivider: {
    height: 17,
    width: 1,
    backgroundColor: '#343434',
  },

  carInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    marginVertical: 16,
  },

  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  priceContainer: {
    flex: 1,
  },

  priceLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 5,
  },

  currency: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },

  price: {
    color: GOLD,
    fontSize: 23,
    fontWeight: '900',
  },

  priceUnit: {
    color: MUTED,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 3,
  },

  bookButton: {
    minHeight: 46,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  bookButtonText: {
    color: '#17120A',
    fontSize: 12,
    fontWeight: '900',
  },

  // PAGINATION
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 26,
  },

  paginationGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  paginationDot: {
    width: 7,
    height: 7,
    backgroundColor: '#55575B',
  },

  paginationDotActive: {
    width: 19,
    backgroundColor: GOLD,
  },

  paginationCount: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
  },

  // RECOMMENDED CARS
  recommendedHeader: {
    paddingHorizontal: 21,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recommendedCount: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  recommendedList: {
    paddingHorizontal: 20,
    gap: 13,
  },

  recCard: {
    width: 190,
    backgroundColor: '#141619',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },

  // RECOMMENDED IMAGE: SHOW FULL VEHICLE
  recImageContainer: {
    width: '100%',
    height: 135,
    position: 'relative',
    backgroundColor: '#0B0D0F',
    overflow: 'hidden',
  },

  recImage: {
    width: '100%',
    height: '100%',
  },

  recImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recRating: {
    position: 'absolute',
    right: 9,
    top: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  recRatingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  recInfo: {
    padding: 12,
  },

  recCategory: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  recName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },

  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 4,
  },

  recPrice: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '900',
  },

  recPriceSub: {
    color: MUTED,
    fontSize: 10,
  },

  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  recExplore: {
    color: '#BBBBBB',
    fontSize: 10,
    fontWeight: '600',
  },

  // EXPERIENCE BANNER
  experienceBanner: {
    marginHorizontal: 20,
    marginTop: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.42)',
  },

  experienceGradient: {
    minHeight: 215,
    padding: 19,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  experienceContent: {
    width: '78%',
    zIndex: 2,
  },

  experienceEyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 11,
  },

  experienceTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  experienceGoldTitle: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '900',
  },

  experienceDescription: {
    color: '#B9B9B9',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 9,
  },

  experienceServices: {
    flexDirection: 'row',
    gap: 17,
    marginTop: 17,
  },

  experienceService: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  experienceServiceText: {
    color: GOLD_LIGHT,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  bannerDecoration: {
    position: 'absolute',
    right: -10,
    bottom: 17,
    zIndex: 1,
  },

  // FOOTER
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },

  footerLine: {
    width: 45,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 14,
  },

  footerBrand: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: MUTED,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 6,
  },
});
