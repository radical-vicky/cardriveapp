
import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOLD = '#D6AD62';
const GOLD_LIGHT = '#F0D8A5';
const BACKGROUND = '#08090B';
const SURFACE = '#121418';
const MUTED = '#92949A';
const BORDER = 'rgba(255,255,255,0.09)';

const formatPrice = (value: number) =>
  `KES ${value.toLocaleString('en-KE')}`;

export default function CarDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCarDetails = useCallback(async () => {
    if (!id) {
      setError('No vehicle was selected.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('This vehicle could not be found.');
        setCar(null);
      } else {
        setCar(data);
      }
    } catch (err) {
      console.error('Car details error:', err);
      setError('Unable to load vehicle details. Please try again.');
      setCar(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCarDetails();
  }, [fetchCarDetails]);

  const handleBooking = () => {
    if (!car) return;

    router.push({
      pathname: '/booking-dates',
      params: {
        id: String(car.id),
        price: String(car.price_per_day),
      },
    });
  };

  const price = Number(car?.price_per_day || 0);
  const rating = Number(car?.rating || 0);

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Preparing your experience...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

        <View style={styles.errorIcon}>
          <Ionicons name="car-sport-outline" size={34} color={GOLD} />
        </View>

        <Text style={styles.errorTitle}>Vehicle unavailable</Text>

        <Text style={styles.errorDescription}>
          {error || 'We could not find the vehicle you requested.'}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchCarDetails}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Try Again</Text>
          <Ionicons name="refresh" size={17} color={BACKGROUND} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BACKGROUND}
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* FULL VEHICLE SHOWCASE */}
        <View style={styles.heroContainer}>
          {car.image_url ? (
            <Image
              source={{ uri: car.image_url }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="car-sport-outline" size={70} color={GOLD} />
              <Text style={styles.placeholderText}>VEHICLE IMAGE</Text>
            </View>
          )}

          <LinearGradient
            colors={[
              'rgba(0,0,0,0.38)',
              'transparent',
              'transparent',
              'rgba(8,9,11,0.45)',
            ]}
            locations={[0, 0.25, 0.65, 1]}
            style={styles.heroGradient}
            pointerEvents="none"
          />

          {/* HEADER */}
          <SafeAreaView style={styles.heroHeader} edges={['top']}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerBrand}>
              <Text style={styles.headerBrandText}>PREMIUM DRIVE</Text>
              <View style={styles.headerBrandLine} />
            </View>

            <View style={styles.headerButtonPlaceholder} />
          </SafeAreaView>

          {/* VEHICLE LABEL */}
          <View style={styles.heroBottomLabel}>
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>VEHICLE SHOWCASE</Text>
            </View>

            <Text style={styles.heroBrand}>{car.brand}</Text>
            <Text style={styles.heroCarName}>{car.name}</Text>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {/* VEHICLE TITLE */}
          <View style={styles.titleSection}>
            <View style={styles.titleContent}>
              <Text style={styles.eyebrow}>DISCOVER YOUR NEXT DRIVE</Text>

              <Text style={styles.carTitle}>{car.name}</Text>

              <Text style={styles.carSubtitle}>
                {car.brand}
                {car.year ? ` · ${car.year}` : ''}
                {car.category ? ` · ${car.category}` : ''}
              </Text>
            </View>

            {rating > 0 && (
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={14} color={GOLD} />
                <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                <Text style={styles.ratingCaption}>RATING</Text>
              </View>
            )}
          </View>

          {/* VEHICLE SPECS */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Vehicle overview</Text>
            <Text style={styles.sectionNumber}>01 / 03</Text>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specCard}>
              <View style={styles.specIcon}>
                <Ionicons name="people-outline" size={21} color={GOLD} />
              </View>
              <Text style={styles.specLabel}>CAPACITY</Text>
              <Text style={styles.specValue}>
                {car.seats ? `${car.seats} Seats` : 'Not specified'}
              </Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIcon}>
                <Ionicons name="settings-outline" size={21} color={GOLD} />
              </View>
              <Text style={styles.specLabel}>TRANSMISSION</Text>
              <Text style={styles.specValue}>
                {car.transmission || 'Not specified'}
              </Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIcon}>
                <Ionicons name="speedometer-outline" size={21} color={GOLD} />
              </View>
              <Text style={styles.specLabel}>MILEAGE</Text>
              <Text style={styles.specValue}>Unlimited</Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIcon}>
                <Ionicons name="car-outline" size={21} color={GOLD} />
              </View>
              <Text style={styles.specLabel}>CATEGORY</Text>
              <Text style={styles.specValue}>
                {car.category || 'Premium'}
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>About this vehicle</Text>
            <Text style={styles.sectionNumber}>02 / 03</Text>
          </View>

          <View style={styles.descriptionCard}>
            <View style={styles.descriptionAccent} />

            <Text style={styles.descriptionText}>
              {car.description ||
                `Experience the perfect blend of luxury, comfort and performance with the ${car.name}. Whether you are travelling for business, enjoying a weekend getaway or celebrating a special occasion, this ${car.brand} offers an exceptional driving experience.`}
            </Text>
          </View>

          {/* RENTAL INFORMATION */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Rental information</Text>
            <Text style={styles.sectionNumber}>03 / 03</Text>
          </View>

          <View style={styles.rentalCard}>
            <View style={styles.rentalRow}>
              <View style={styles.rentalIcon}>
                <Ionicons name="calendar-outline" size={19} color={GOLD} />
              </View>

              <View style={styles.rentalDetails}>
                <Text style={styles.rentalTitle}>Flexible rental dates</Text>
                <Text style={styles.rentalSubtitle}>
                  Choose your preferred pick-up and return dates.
                </Text>
              </View>

              <Ionicons name="checkmark-circle" size={19} color={GOLD} />
            </View>

            <View style={styles.rentalDivider} />

            <View style={styles.rentalRow}>
              <View style={styles.rentalIcon}>
                <Ionicons name="cash-outline" size={19} color={GOLD} />
              </View>

              <View style={styles.rentalDetails}>
                <Text style={styles.rentalTitle}>Transparent daily rate</Text>
                <Text style={styles.rentalSubtitle}>
                  Your estimated cost depends on rental duration.
                </Text>
              </View>

              <Ionicons name="checkmark-circle" size={19} color={GOLD} />
            </View>
          </View>

          <View style={styles.bottomNote}>
            <Ionicons name="shield-checkmark-outline" size={17} color={GOLD} />

            <Text style={styles.bottomNoteText}>
              Your booking details and final price will be reviewed before
              confirmation.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOOKING BAR */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>DAILY RENTAL RATE</Text>

            <Text style={styles.priceValue}>
              {formatPrice(price)}
            </Text>

            <Text style={styles.perDay}>PER DAY</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book this car</Text>
            <Ionicons name="arrow-forward" size={19} color={BACKGROUND} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    paddingBottom: 150,
  },

  stateContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 17,
    letterSpacing: 0.5,
  },

  errorIcon: {
    width: 76,
    height: 76,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  errorTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  errorDescription: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: GOLD,
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginTop: 25,
    borderRadius: 4,
  },

  retryText: {
    color: BACKGROUND,
    fontWeight: '800',
    fontSize: 14,
  },

  goBackButton: {
    padding: 15,
    marginTop: 5,
  },

  goBackText: {
    color: GOLD_LIGHT,
    fontSize: 13,
    fontWeight: '600',
  },

  /* FULL VEHICLE IMAGE */

  heroContainer: {
    height: 480,
    width: '100%',
    position: 'relative',
    backgroundColor: '#08090B',
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17191D',
  },

  placeholderText: {
    color: MUTED,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 12,
  },

  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerBrand: {
    alignItems: 'center',
  },

  headerBrandText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },

  headerBrandLine: {
    width: 28,
    height: 2,
    backgroundColor: GOLD,
    marginTop: 6,
  },

  headerButtonPlaceholder: {
    width: 43,
  },

  heroBottomLabel: {
    position: 'absolute',
    bottom: 25,
    left: SIZES.padding,
    right: SIZES.padding,
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(8,9,11,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.4)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 13,
    gap: 7,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },

  availableText: {
    color: GOLD_LIGHT,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  heroBrand: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  heroCarName: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  /* CONTENT */

  contentContainer: {
    paddingHorizontal: SIZES.padding,
    marginTop: 4,
  },

  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  titleContent: {
    flex: 1,
  },

  eyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 9,
  },

  carTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  carSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 7,
  },

  ratingBox: {
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },

  ratingValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },

  ratingCaption: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },

  /* SECTION HEADERS */

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionNumber: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  /* SPECS */

  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 29,
  },

  specCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 15,
    minHeight: 116,
  },

  specIcon: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(214,173,98,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },

  specLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
  },

  specValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* DESCRIPTION */

  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 17,
    marginBottom: 28,
  },

  descriptionAccent: {
    width: 3,
    backgroundColor: GOLD,
    marginRight: 14,
  },

  descriptionText: {
    flex: 1,
    color: '#B6B8BD',
    fontSize: 13,
    lineHeight: 22,
  },

  /* RENTAL INFO */

  rentalCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 16,
  },

  rentalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 55,
  },

  rentalIcon: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(214,173,98,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  rentalDetails: {
    flex: 1,
  },

  rentalTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  rentalSubtitle: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
  },

  rentalDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 20,
  },

  bottomNoteText: {
    flex: 1,
    color: MUTED,
    fontSize: 10,
    lineHeight: 17,
  },

  /* BOOKING BAR */

  bottomSafeArea: {
    backgroundColor: '#101216',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  bottomBar: {
    minHeight: 83,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  priceContainer: {
    flex: 1,
  },

  priceLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  priceValue: {
    color: GOLD_LIGHT,
    fontSize: 19,
    fontWeight: '900',
  },

  perDay: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },

  bookButton: {
    minWidth: 155,
    height: 52,
    backgroundColor: GOLD,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 17,
  },

  bookButtonText: {
    color: BACKGROUND,
    fontSize: 13,
    fontWeight: '900',
  },
});
