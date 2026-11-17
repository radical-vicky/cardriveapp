
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

const COLORS = {
  background: '#08090B',
  surface: '#121418',
  surfaceLight: '#191C21',
  primary: '#D6AD62',
  goldLight: '#F0D8A5',
  text: '#FFFFFF',
  textSecondary: '#92949A',
  border: 'rgba(255,255,255,0.09)',
  success: '#62C99A',
  warning: '#E6B65C',
  danger: '#E47777',
};

const TABS = ['Upcoming', 'Active', 'Past'] as const;
type BookingTab = (typeof TABS)[number];

type Booking = {
  id: string | number;
  status?: string;
  pickup_date?: string;
  return_date?: string;
  drive_type?: string;
  total_price?: number | string;
  created_at?: string;
  car_id?: string;
  cars?: any;
};

const formatPrice = (value: number | string | undefined) => {
  const amount = Number(value) || 0;
  return `KES ${amount.toLocaleString('en-KE')}`;
};

const getCar = (booking: Booking) => {
  if (Array.isArray(booking.cars)) return booking.cars[0] || null;
  return booking.cars || null;
};

const normalizeStatus = (status?: string) =>
  (status || '').trim().toLowerCase();

const belongsToTab = (status: string | undefined, tab: BookingTab) => {
  const value = normalizeStatus(status);

  if (tab === 'Upcoming') {
    return ['upcoming', 'pending', 'confirmed', 'scheduled'].includes(value);
  }

  if (tab === 'Active') {
    return ['active', 'in_progress', 'in progress', 'ongoing'].includes(value);
  }

  return [
    'past',
    'completed',
    'cancelled',
    'canceled',
    'rejected',
    'expired',
  ].includes(value);
};

const getStatusStyle = (status?: string) => {
  const value = normalizeStatus(status);

  if (['active', 'in_progress', 'in progress', 'ongoing'].includes(value)) {
    return {
      color: COLORS.success,
      backgroundColor: 'rgba(98,201,154,0.10)',
      icon: 'radio-button-on-outline' as const,
    };
  }

  if (['completed', 'past'].includes(value)) {
    return {
      color: COLORS.textSecondary,
      backgroundColor: 'rgba(255,255,255,0.07)',
      icon: 'checkmark-circle-outline' as const,
    };
  }

  if (['cancelled', 'canceled', 'rejected', 'expired'].includes(value)) {
    return {
      color: COLORS.danger,
      backgroundColor: 'rgba(228,119,119,0.10)',
      icon: 'close-circle-outline' as const,
    };
  }

  return {
    color: COLORS.primary,
    backgroundColor: 'rgba(214,173,98,0.10)',
    icon: 'time-outline' as const,
  };
};

const formatCreatedDate = (date?: string) => {
  if (!date) return 'Not available';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return parsed.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<BookingTab>('Upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | number | null>(null);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setBookings([]);
        setErrorMessage('Please sign in to view your bookings.');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*, cars(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'Unable to load your bookings. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => belongsToTab(booking.status, activeTab)),
    [bookings, activeTab],
  );

  const tabCounts = useMemo(() => ({
    Upcoming: bookings.filter((booking) => belongsToTab(booking.status, 'Upcoming')).length,
    Active: bookings.filter((booking) => belongsToTab(booking.status, 'Active')).length,
    Past: bookings.filter((booking) => belongsToTab(booking.status, 'Past')).length,
  }), [bookings]);

  const handleExpand = (id: string | number) => {
    setExpandedBooking((current) => current === id ? null : id);
  };

  const renderBooking = (booking: Booking) => {
    const car = getCar(booking);
    const statusStyle = getStatusStyle(booking.status);
    const isExpanded = expandedBooking === booking.id;
    const carName = car
      ? [car.brand, car.name].filter(Boolean).join(' ')
      : 'Vehicle details unavailable';

    return (
      <View key={booking.id} style={styles.bookingCard}>
        {/* Vehicle Image */}
        <View style={styles.imageContainer}>
          {car?.image_url ? (
            <Image
              source={{ uri: car.image_url }}
              style={styles.bookingImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="car-sport-outline" size={43} color={COLORS.primary} />
              <Text style={styles.fallbackText}>VEHICLE IMAGE UNAVAILABLE</Text>
            </View>
          )}

          <View style={styles.imageOverlay} />

          <View style={styles.imageCategory}>
            <Text style={styles.imageCategoryText}>
              {car?.category || 'PREMIUM VEHICLE'}
            </Text>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.bookingDetails}>
          <View style={styles.cardHeader}>
            <View style={styles.carTitleContainer}>
              <Text style={styles.carName} numberOfLines={1}>
                {carName}
              </Text>
              <Text style={styles.carSubtitle}>
                {car?.year ? `${car.year} MODEL` : 'YOUR RESERVATION'}
              </Text>
            </View>

            <View style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}>
              <Ionicons
                name={statusStyle.icon}
                size={12}
                color={statusStyle.color}
              />
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {booking.status || 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>RENTAL PERIOD</Text>
              <Text style={styles.infoText}>
                {booking.pickup_date || 'Not specified'}
              </Text>
              <Text style={styles.infoTextSecondary}>
                to {booking.return_date || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="car-outline" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>DRIVE TYPE</Text>
              <Text style={styles.infoText}>
                {booking.drive_type || 'Not specified'}
              </Text>
            </View>
          </View>

          {/* Price and Details */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>BOOKING TOTAL</Text>
              <Text style={styles.priceValue}>
                {formatPrice(booking.total_price)}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.detailsButton}
              onPress={() => handleExpand(booking.id)}
            >
              <Text style={styles.detailsButtonText}>
                {isExpanded ? 'Less details' : 'View details'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Expandable Details */}
          {isExpanded && (
            <View style={styles.expandedDetails}>
              <View style={styles.expandedDivider} />

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Booking ID</Text>
                <Text style={styles.expandedValue}>#{booking.id}</Text>
              </View>

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Vehicle</Text>
                <Text style={styles.expandedValue}>{carName}</Text>
              </View>

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Transmission</Text>
                <Text style={styles.expandedValue}>
                  {car?.transmission || 'Not specified'}
                </Text>
              </View>

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Seats</Text>
                <Text style={styles.expandedValue}>
                  {car?.seats ? `${car.seats} seats` : 'Not specified'}
                </Text>
              </View>

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Booked on</Text>
                <Text style={styles.expandedValue}>
                  {formatCreatedDate(booking.created_at)}
                </Text>
              </View>

              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Vehicle ID</Text>
                <Text style={styles.expandedValue}>
                  {booking.car_id || 'Not available'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>YOUR JOURNEY</Text>
            <Text style={styles.headerTitle}>My Bookings</Text>
            <Text style={styles.headerSubtitle}>
              Manage your reservations in one place.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchBookings(true)}
            disabled={loading || refreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={21}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Booking Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <Ionicons name="car-sport-outline" size={23} color={COLORS.primary} />
          </View>

          <View style={styles.overviewText}>
            <Text style={styles.overviewLabel}>TOTAL RESERVATIONS</Text>
            <Text style={styles.overviewNumber}>{bookings.length}</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewRight}>
            <Text style={styles.overviewLabel}>UPCOMING TRIPS</Text>
            <Text style={styles.overviewNumber}>{tabCounts.Upcoming}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => {
                  setActiveTab(tab);
                  setExpandedBooking(null);
                }}
              >
                <Text style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}>
                  {tab}
                </Text>

                <View style={[
                  styles.tabCount,
                  isActive && styles.tabCountActive,
                ]}>
                  <Text style={[
                    styles.tabCountText,
                    isActive && styles.tabCountTextActive,
                  ]}>
                    {tabCounts[tab]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Booking List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(true)}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.surface}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={35}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>Unable to load bookings</Text>
              <Text style={styles.emptyDescription}>{errorMessage}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchBookings()}
              >
                <Ionicons name="refresh-outline" size={17} color={COLORS.background} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={35}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No {activeTab.toLowerCase()} bookings
              </Text>

              <Text style={styles.emptyDescription}>
                {activeTab === 'Upcoming'
                  ? 'Your next journey starts here. Explore our vehicles and make your first reservation.'
                  : activeTab === 'Active'
                    ? 'You do not have any active rentals at the moment.'
                    : 'Your completed and cancelled reservations will appear here.'}
              </Text>

              {activeTab === 'Upcoming' && (
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => {
                    // Change this route if your vehicle discovery screen uses another path.
                    // This button is intentionally not linked to an unknown route.
                  }}
                >
                  <Text style={styles.exploreButtonText}>
                    Explore vehicles
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.listHeading}>
                <Text style={styles.listHeadingTitle}>
                  {activeTab} reservations
                </Text>
                <Text style={styles.listHeadingCount}>
                  {filteredBookings.length} {filteredBookings.length === 1 ? 'BOOKING' : 'BOOKINGS'}
                </Text>
              </View>

              {filteredBookings.map(renderBooking)}
            </>
          )}

          <View style={{ height: 35 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 7,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  refreshButton: {
    width: 43,
    height: 43,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewCard: {
    marginHorizontal: 22,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewIcon: {
    width: 43,
    height: 43,
    backgroundColor: 'rgba(214,173,98,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  overviewText: {
    flex: 1,
  },

  overviewLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  overviewNumber: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 4,
  },

  overviewDivider: {
    width: 1,
    height: 37,
    backgroundColor: COLORS.border,
    marginHorizontal: 15,
  },

  overviewRight: {
    minWidth: 88,
  },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 9,
    marginBottom: 22,
  },

  tabButton: {
    flex: 1,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  tabButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(214,173,98,0.09)',
  },

  tabText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  tabTextActive: {
    color: COLORS.goldLight,
    fontWeight: '800',
  },

  tabCount: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
  },

  tabCountActive: {
    backgroundColor: COLORS.primary,
  },

  tabCountText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },

  tabCountTextActive: {
    color: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  listHeadingTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  listHeadingCount: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  bookingCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 17,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 178,
    backgroundColor: COLORS.surfaceLight,
  },

  bookingImage: {
    width: '100%',
    height: '100%',
  },

  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  fallbackText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '700',
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.09)',
  },

  imageCategory: {
    position: 'absolute',
    bottom: 12,
    left: 13,
    backgroundColor: 'rgba(8,9,11,0.82)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.3)',
  },

  imageCategoryText: {
    color: COLORS.goldLight,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  bookingDetails: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 19,
    gap: 8,
  },

  carTitleContainer: {
    flex: 1,
  },

  carName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  carSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 14,
  },

  infoIcon: {
    width: 34,
    height: 34,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },

  infoText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },

  infoTextSecondary: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
    marginTop: 3,
    gap: 10,
  },

  priceLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },

  priceValue: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.3)',
  },

  detailsButtonText: {
    color: COLORS.goldLight,
    fontSize: 10,
    fontWeight: '700',
  },

  expandedDetails: {
    marginTop: 6,
  },

  expandedDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 15,
  },

  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },

  expandedLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  expandedValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 75,
    gap: 15,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 65,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 77,
    height: 77,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 290,
  },

  retryButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  retryButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
  },

  exploreButton: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  exploreButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
