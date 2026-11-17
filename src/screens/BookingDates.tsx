
import { COLORS, SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GOLD = '#D6AD62';
const GOLD_LIGHT = '#F0D8A5';
const BACKGROUND = '#08090B';
const SURFACE = '#121418';
const MUTED = '#92949A';
const BORDER = 'rgba(255,255,255,0.09)';

const MOCK_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function BookingDatesScreen() {
  const router = useRouter();
  const { id, price } = useLocalSearchParams();

  const [pickupDate, setPickupDate] = useState<number | null>(20);
  const [returnDate, setReturnDate] = useState<number | null>(23);

  const handleDayPress = (day: number) => {
    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(day);
      setReturnDate(null);
    } else if (day > pickupDate) {
      setReturnDate(day);
    } else {
      setPickupDate(day);
      setReturnDate(null);
    }
  };

  const calculateDays = () => {
    if (pickupDate && returnDate) {
      return returnDate - pickupDate;
    }
    return 0;
  };

  const days = calculateDays();
  const totalPrice = days * Number(price || 0);

  const formatPrice = (amount: number) =>
    `KES ${amount.toLocaleString('en-KE')}`;

  const getWeekday = (day: number) => {
    const date = new Date(2026, 10, day);
    return WEEK_DAYS[date.getDay()];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={21} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Dates</Text>
          <Text style={styles.headerSubtitle}>YOUR RENTAL SCHEDULE</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="calendar-outline" size={21} color={GOLD} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROGRESS */}
        <View style={styles.progressSection}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>BOOKING PROCESS</Text>
            <Text style={styles.progressStep}>STEP 01 OF 03</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
            <View style={styles.progressInactive} />
          </View>
        </View>

        {/* INTRODUCTION */}
        <View style={styles.introSection}>
          <Text style={styles.eyebrow}>PLAN YOUR EXPERIENCE</Text>

          <Text style={styles.mainTitle}>
            When would you
            {'\n'}
            like to drive?
          </Text>

          <Text style={styles.introDescription}>
            Select your preferred pick-up and return dates to calculate your
            rental cost.
          </Text>
        </View>

        {/* CALENDAR */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarTop}>
            <View>
              <Text style={styles.calendarCaption}>SELECT YOUR DATES</Text>
              <Text style={styles.monthText}>November 2026</Text>
            </View>

            <View style={styles.calendarIcon}>
              <Ionicons name="calendar" size={20} color={GOLD} />
            </View>
          </View>

          <View style={styles.calendarDivider} />

          {/* WEEKDAYS */}
          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* CALENDAR DAYS */}
          <View style={styles.calendarGrid}>
            {MOCK_DAYS.map((day) => {
              const isPickup = pickupDate === day;
              const isReturn = returnDate === day;
              const isSelected = isPickup || isReturn;

              const isInRange =
                pickupDate !== null &&
                returnDate !== null &&
                day > pickupDate &&
                day < returnDate;

              return (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.75}
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.dayBox,
                    isInRange && styles.dayBoxInRange,
                    isSelected && styles.dayBoxSelected,
                    isPickup && styles.pickupDay,
                    isReturn && styles.returnDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isInRange && styles.dayTextInRange,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>

                  {isPickup && (
                    <View style={styles.dayIndicator} />
                  )}

                  {isReturn && (
                    <View style={styles.dayIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CALENDAR LEGEND */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={styles.legendSelected} />
              <Text style={styles.legendText}>Selected dates</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendRange} />
              <Text style={styles.legendText}>Rental period</Text>
            </View>
          </View>
        </View>

        {/* DATE SELECTION SUMMARY */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your schedule</Text>
          <Text style={styles.sectionTag}>RENTAL DETAILS</Text>
        </View>

        <View style={styles.scheduleCard}>
          {/* PICKUP */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="log-in-outline" size={21} color={GOLD} />
            </View>

            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>PICK-UP DATE</Text>
              <Text style={styles.scheduleDate}>
                {pickupDate
                  ? `${getWeekday(pickupDate)} ${pickupDate} NOV 2026`
                  : 'Select pick-up date'}
              </Text>
              <Text style={styles.scheduleTime}>09:00 AM</Text>
            </View>

            <View style={styles.scheduleStatus}>
              <Ionicons
                name={pickupDate ? 'checkmark-circle' : 'ellipse-outline'}
                size={19}
                color={pickupDate ? GOLD : MUTED}
              />
            </View>
          </View>

          <View style={styles.scheduleDivider}>
            <View style={styles.scheduleDividerLine} />
            <View style={styles.durationPill}>
              <Ionicons name="time-outline" size={12} color={GOLD} />
              <Text style={styles.durationPillText}>
                {days > 0 ? `${days} DAYS` : 'DURATION'}
              </Text>
            </View>
            <View style={styles.scheduleDividerLine} />
          </View>

          {/* RETURN */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="log-out-outline" size={21} color={GOLD} />
            </View>

            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>RETURN DATE</Text>
              <Text style={styles.scheduleDate}>
                {returnDate
                  ? `${getWeekday(returnDate)} ${returnDate} NOV 2026`
                  : 'Select return date'}
              </Text>
              <Text style={styles.scheduleTime}>09:00 AM</Text>
            </View>

            <View style={styles.scheduleStatus}>
              <Ionicons
                name={returnDate ? 'checkmark-circle' : 'ellipse-outline'}
                size={19}
                color={returnDate ? GOLD : MUTED}
              />
            </View>
          </View>
        </View>

        {/* RENTAL PRICE BREAKDOWN */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Price estimate</Text>
          <Text style={styles.sectionTag}>COST SUMMARY</Text>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Daily rental rate</Text>
            <Text style={styles.priceValue}>
              {formatPrice(Number(price || 0))}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Rental duration</Text>
            <Text style={styles.priceValue}>
              {days} {days === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceTotalRow}>
            <View>
              <Text style={styles.totalCaption}>ESTIMATED TOTAL</Text>
              <Text style={styles.totalDescription}>
                Based on selected rental dates
              </Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>

        {/* NOTE */}
        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={GOLD}
          />

          <Text style={styles.infoNoteText}>
            Your final booking price and vehicle availability will be
            confirmed before payment.
          </Text>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomBar}>
          <View style={styles.bottomPrice}>
            <Text style={styles.bottomPriceLabel}>ESTIMATED TOTAL</Text>
            <Text style={styles.bottomPriceValue}>
              {formatPrice(totalPrice)}
            </Text>
            <Text style={styles.bottomPriceDuration}>
              {days > 0 ? `${days} DAYS RENTAL` : 'SELECT YOUR DATES'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!pickupDate || !returnDate) && styles.continueDisabled,
            ]}
            disabled={!pickupDate || !returnDate}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/booking-extras',
                params: {
                  id,
                  pickupDate,
                  returnDate,
                  days,
                  basePrice: price,
                },
              })
            }
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={BACKGROUND} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    minHeight: 68,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 4,
  },

  headerRight: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* PROGRESS */

  progressSection: {
    marginTop: 24,
    marginBottom: 29,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  progressLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  progressStep: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  progressTrack: {
    flexDirection: 'row',
    gap: 5,
    height: 3,
  },

  progressActive: {
    flex: 1,
    backgroundColor: GOLD,
  },

  progressInactive: {
    flex: 1,
    backgroundColor: '#292C31',
  },

  /* INTRO */

  introSection: {
    marginBottom: 25,
  },

  eyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },

  mainTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  introDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 310,
  },

  /* CALENDAR */

  calendarCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 16,
    marginBottom: 29,
  },

  calendarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  calendarCaption: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  monthText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  calendarIcon: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  calendarDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 15,
  },

  weekHeader: {
    flexDirection: 'row',
    marginBottom: 9,
  },

  weekDayCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 31,
  },

  weekDayText: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayBox: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 3,
    position: 'relative',
  },

  dayBoxInRange: {
    backgroundColor: 'rgba(214,173,98,0.12)',
    borderRadius: 0,
  },

  dayBoxSelected: {
    backgroundColor: GOLD,
    borderRadius: 4,
  },

  pickupDay: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  returnDay: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  dayText: {
    color: '#E6E6E6',
    fontSize: 13,
    fontWeight: '600',
  },

  dayTextInRange: {
    color: GOLD_LIGHT,
    fontWeight: '800',
  },

  dayTextSelected: {
    color: BACKGROUND,
    fontWeight: '900',
  },

  dayIndicator: {
    position: 'absolute',
    bottom: 5,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: BACKGROUND,
  },

  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 14,
    paddingTop: 14,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  legendSelected: {
    width: 10,
    height: 10,
    backgroundColor: GOLD,
    borderRadius: 2,
  },

  legendRange: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(214,173,98,0.22)',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.35)',
  },

  legendText: {
    color: MUTED,
    fontSize: 10,
  },

  /* SECTION HEADINGS */

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  sectionTag: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  /* SCHEDULE */

  scheduleCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 16,
    marginBottom: 28,
  },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: 13,
  },

  scheduleIcon: {
    width: 43,
    height: 43,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  scheduleInfo: {
    flex: 1,
  },

  scheduleLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  scheduleDate: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  scheduleTime: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },

  scheduleStatus: {
    width: 25,
    alignItems: 'center',
  },

  scheduleDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9,
    marginLeft: 20,
    gap: 10,
  },

  scheduleDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },

  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
  },

  durationPillText: {
    color: GOLD_LIGHT,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  /* PRICE BREAKDOWN */

  priceCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 17,
    marginBottom: 17,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  priceLabel: {
    color: MUTED,
    fontSize: 12,
  },

  priceValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  priceDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 5,
  },

  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
    gap: 8,
  },

  totalCaption: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  totalDescription: {
    color: MUTED,
    fontSize: 9,
  },

  totalAmount: {
    color: GOLD_LIGHT,
    fontSize: 18,
    fontWeight: '900',
  },

  /* NOTE */

  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 15,
  },

  infoNoteText: {
    flex: 1,
    color: MUTED,
    fontSize: 10,
    lineHeight: 17,
  },

  /* BOTTOM BAR */

  bottomSafeArea: {
    backgroundColor: '#101216',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 13,
    gap: 12,
  },

  bottomPrice: {
    flex: 1,
  },

  bottomPriceLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },

  bottomPriceValue: {
    color: GOLD_LIGHT,
    fontSize: 19,
    fontWeight: '900',
  },

  bottomPriceDuration: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginTop: 4,
  },

  continueButton: {
    height: 51,
    minWidth: 145,
    paddingHorizontal: 17,
    backgroundColor: GOLD,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  continueDisabled: {
    opacity: 0.45,
  },

  continueButtonText: {
    color: BACKGROUND,
    fontSize: 13,
    fontWeight: '900',
  },
});
