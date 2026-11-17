
import { COLORS, SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

const CHAUFFEUR_PRICE = 2000;
const GPS_PRICE = 500;
const CHILD_SEAT_PRICE = 300;

const formatPrice = (amount: number) =>
  `KES ${amount.toLocaleString('en-KE')}`;

export default function BookingExtrasScreen() {
  const router = useRouter();

  const { id, pickupDate, returnDate, days, basePrice } =
    useLocalSearchParams();

  const durationDays = Number(days) || 1;
  const dailyRate = Number(basePrice) || 0;

  const [hasChauffeur, setHasChauffeur] = useState(false);
  const [hasGps, setHasGps] = useState(false);
  const [hasChildSeat, setHasChildSeat] = useState(false);

  // SERVICE TOTALS
  const chauffeurTotal = hasChauffeur
    ? CHAUFFEUR_PRICE * durationDays
    : 0;

  const gpsTotal = hasGps
    ? GPS_PRICE * durationDays
    : 0;

  const childSeatTotal = hasChildSeat
    ? CHILD_SEAT_PRICE * durationDays
    : 0;

  const baseTotal = dailyRate * durationDays;

  const extrasTotal =
    chauffeurTotal + gpsTotal + childSeatTotal;

  const finalTotal = baseTotal + extrasTotal;

  const selectedExtras = [
    hasChauffeur,
    hasGps,
    hasChildSeat,
  ].filter(Boolean).length;

  const toggleChauffeur = () => {
    setHasChauffeur((current) => !current);
  };

  const toggleGps = () => {
    setHasGps((current) => !current);
  };

  const toggleChildSeat = () => {
    setHasChildSeat((current) => !current);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/checkout',
      params: {
        id,
        pickupDate,
        returnDate,
        days: durationDays,
        totalPrice: finalTotal,
        hasChauffeur: hasChauffeur ? 'true' : 'false',
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={BACKGROUND}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Services & Extras
          </Text>
          <Text style={styles.headerSubtitle}>
            PERSONALISE YOUR EXPERIENCE
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="options-outline"
            size={21}
            color={GOLD}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BOOKING PROGRESS */}
        <View style={styles.progressSection}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>
              BOOKING PROCESS
            </Text>
            <Text style={styles.progressStep}>
              STEP 02 OF 03
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressComplete} />
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
          </View>
        </View>

        {/* INTRODUCTION */}
        <View style={styles.introSection}>
          <Text style={styles.eyebrow}>
            MAKE IT YOURS
          </Text>

          <Text style={styles.mainTitle}>
            Enhance your
            {'\n'}
            driving experience.
          </Text>

          <Text style={styles.introDescription}>
            Choose the services and additional features that make
            your journey more comfortable.
          </Text>
        </View>

        {/* RENTAL SUMMARY */}
        <View style={styles.tripSummary}>
          <View style={styles.tripSummaryTop}>
            <View style={styles.tripIcon}>
              <Ionicons
                name="car-sport-outline"
                size={22}
                color={GOLD}
              />
            </View>

            <View style={styles.tripSummaryInfo}>
              <Text style={styles.tripSummaryLabel}>
                YOUR RENTAL
              </Text>
              <Text style={styles.tripSummaryTitle}>
                Premium vehicle reservation
              </Text>
            </View>

            <View style={styles.confirmedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color={GOLD}
              />
              <Text style={styles.confirmedText}>
                SELECTED
              </Text>
            </View>
          </View>

          <View style={styles.tripDivider} />

          <View style={styles.tripDates}>
            <View style={styles.tripDateItem}>
              <Text style={styles.tripDateLabel}>
                PICK-UP
              </Text>
              <Text style={styles.tripDateValue}>
                {pickupDate ? String(pickupDate) : '--'}
              </Text>
            </View>

            <View style={styles.tripDateCenter}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={GOLD}
              />
            </View>

            <View style={styles.tripDateItem}>
              <Text style={styles.tripDateLabel}>
                RETURN
              </Text>
              <Text style={styles.tripDateValue}>
                {returnDate ? String(returnDate) : '--'}
              </Text>
            </View>

            <View style={styles.tripDuration}>
              <Text style={styles.tripDateLabel}>
                DURATION
              </Text>
              <Text style={styles.tripDurationValue}>
                {durationDays} DAYS
              </Text>
            </View>
          </View>
        </View>

        {/* DRIVING EXPERIENCE */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Driving experience
            </Text>
            <Text style={styles.sectionDescription}>
              How would you like to travel?
            </Text>
          </View>

          <Text style={styles.sectionNumber}>
            01
          </Text>
        </View>

        <View style={styles.driveTypeContainer}>
          {/* SELF DRIVE */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setHasChauffeur(false)}
            style={[
              styles.driveTypeCard,
              !hasChauffeur && styles.driveTypeCardActive,
            ]}
          >
            <View style={styles.driveTypeTop}>
              <View
                style={[
                  styles.driveIcon,
                  !hasChauffeur && styles.driveIconActive,
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={22}
                  color={!hasChauffeur ? GOLD : MUTED}
                />
              </View>

              <View
                style={[
                  styles.radioCircle,
                  !hasChauffeur && styles.radioCircleActive,
                ]}
              >
                {!hasChauffeur && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>

            <Text
              style={[
                styles.driveTypeTitle,
                !hasChauffeur && styles.driveTypeTitleActive,
              ]}
            >
              Self-drive
            </Text>

            <Text style={styles.driveTypeDescription}>
              Enjoy the freedom of driving yourself.
            </Text>

            <Text style={styles.includedText}>
              INCLUDED
            </Text>
          </TouchableOpacity>

          {/* CHAUFFEUR */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setHasChauffeur(true)}
            style={[
              styles.driveTypeCard,
              hasChauffeur && styles.driveTypeCardActive,
            ]}
          >
            <View style={styles.driveTypeTop}>
              <View
                style={[
                  styles.driveIcon,
                  hasChauffeur && styles.driveIconActive,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={hasChauffeur ? GOLD : MUTED}
                />
              </View>

              <View
                style={[
                  styles.radioCircle,
                  hasChauffeur && styles.radioCircleActive,
                ]}
              >
                {hasChauffeur && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>

            <Text
              style={[
                styles.driveTypeTitle,
                hasChauffeur && styles.driveTypeTitleActive,
              ]}
            >
              With chauffeur
            </Text>

            <Text style={styles.driveTypeDescription}>
              Relax while a professional drives.
            </Text>

            <Text style={styles.drivePrice}>
              + {formatPrice(CHAUFFEUR_PRICE)} / DAY
            </Text>
          </TouchableOpacity>
        </View>

        {/* OPTIONAL EXTRAS */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Additional extras
            </Text>
            <Text style={styles.sectionDescription}>
              Add more comfort and convenience.
            </Text>
          </View>

          <Text style={styles.sectionNumber}>
            02
          </Text>
        </View>

        <View style={styles.extrasList}>
          {/* GPS */}
          <TouchableOpacity
            style={[
              styles.extraCard,
              hasGps && styles.extraCardActive,
            ]}
            onPress={toggleGps}
            activeOpacity={0.8}
          >
            <View style={styles.extraIcon}>
              <Ionicons
                name="navigate-outline"
                size={23}
                color={GOLD}
              />
            </View>

            <View style={styles.extraDetails}>
              <Text style={styles.extraName}>
                GPS Navigation
              </Text>

              <Text style={styles.extraDescription}>
                Navigate your journey with confidence.
              </Text>

              <Text style={styles.extraRate}>
                {formatPrice(GPS_PRICE)} / DAY
              </Text>
            </View>

            <View style={styles.extraAction}>
              <Text style={styles.extraActionText}>
                {hasGps ? 'ADDED' : 'ADD'}
              </Text>

              <View
                style={[
                  styles.checkbox,
                  hasGps && styles.checkboxActive,
                ]}
              >
                {hasGps && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={BACKGROUND}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* CHILD SEAT */}
          <TouchableOpacity
            style={[
              styles.extraCard,
              hasChildSeat && styles.extraCardActive,
            ]}
            onPress={toggleChildSeat}
            activeOpacity={0.8}
          >
            <View style={styles.extraIcon}>
              <Ionicons
                name="happy-outline"
                size={23}
                color={GOLD}
              />
            </View>

            <View style={styles.extraDetails}>
              <Text style={styles.extraName}>
                Child Safety Seat
              </Text>

              <Text style={styles.extraDescription}>
                Extra comfort and safety for little passengers.
              </Text>

              <Text style={styles.extraRate}>
                {formatPrice(CHILD_SEAT_PRICE)} / DAY
              </Text>
            </View>

            <View style={styles.extraAction}>
              <Text style={styles.extraActionText}>
                {hasChildSeat ? 'ADDED' : 'ADD'}
              </Text>

              <View
                style={[
                  styles.checkbox,
                  hasChildSeat && styles.checkboxActive,
                ]}
              >
                {hasChildSeat && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={BACKGROUND}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Your price summary
            </Text>
            <Text style={styles.sectionDescription}>
              A breakdown of your rental cost.
            </Text>
          </View>

          <Text style={styles.sectionNumber}>
            03
          </Text>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Vehicle rental
            </Text>
            <Text style={styles.priceValue}>
              {formatPrice(baseTotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Chauffeur service
            </Text>
            <Text style={styles.priceValue}>
              {formatPrice(chauffeurTotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              GPS navigation
            </Text>
            <Text style={styles.priceValue}>
              {formatPrice(gpsTotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Child safety seat
            </Text>
            <Text style={styles.priceValue}>
              {formatPrice(childSeatTotal)}
            </Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceTotalRow}>
            <View>
              <Text style={styles.priceTotalLabel}>
                TOTAL ESTIMATE
              </Text>
              <Text style={styles.priceTotalSub}>
                {durationDays} rental days · {selectedExtras} extras
              </Text>
            </View>

            <Text style={styles.priceTotalValue}>
              {formatPrice(finalTotal)}
            </Text>
          </View>
        </View>

        {/* TRUST NOTE */}
        <View style={styles.infoNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color={GOLD}
          />

          <Text style={styles.infoNoteText}>
            Your selected services will be included in your booking
            summary. Final availability and pricing are subject to
            confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR */}
      <SafeAreaView
        edges={['bottom']}
        style={styles.bottomSafeArea}
      >
        <View style={styles.bottomBar}>
          <View style={styles.bottomPrice}>
            <Text style={styles.bottomPriceLabel}>
              TOTAL ESTIMATE
            </Text>

            <Text style={styles.bottomPriceValue}>
              {formatPrice(finalTotal)}
            </Text>

            <Text style={styles.bottomPriceSub}>
              {durationDays} DAYS · {selectedExtras} EXTRAS
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              Continue
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={BACKGROUND}
            />
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
    letterSpacing: 1.4,
    marginTop: 4,
  },

  headerRight: {
    width: 42,
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

  progressComplete: {
    flex: 1,
    backgroundColor: GOLD,
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
    fontSize: 29,
    lineHeight: 36,
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

  /* TRIP SUMMARY */

  tripSummary: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 16,
    marginBottom: 30,
  },

  tripSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  tripIcon: {
    width: 43,
    height: 43,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  tripSummaryInfo: {
    flex: 1,
  },

  tripSummaryLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  tripSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  confirmedText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  tripDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 16,
  },

  tripDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tripDateItem: {
    flex: 1,
  },

  tripDateLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },

  tripDateValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  tripDateCenter: {
    width: 30,
    alignItems: 'center',
  },

  tripDuration: {
    alignItems: 'flex-end',
  },

  tripDurationValue: {
    color: GOLD_LIGHT,
    fontSize: 11,
    fontWeight: '900',
  },

  /* SECTION HEADINGS */

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  sectionDescription: {
    color: MUTED,
    fontSize: 10,
    marginTop: 5,
  },

  sectionNumber: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  /* DRIVE TYPE */

  driveTypeContainer: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 30,
  },

  driveTypeCard: {
    flex: 1,
    minHeight: 174,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 13,
  },

  driveTypeCardActive: {
    borderColor: 'rgba(214,173,98,0.65)',
    backgroundColor: '#171713',
  },

  driveTypeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  driveIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1D2025',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  driveIconActive: {
    backgroundColor: 'rgba(214,173,98,0.13)',
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: MUTED,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioCircleActive: {
    borderColor: GOLD,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GOLD,
  },

  driveTypeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 7,
  },

  driveTypeTitleActive: {
    color: GOLD_LIGHT,
  },

  driveTypeDescription: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    minHeight: 34,
  },

  includedText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
  },

  drivePrice: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginTop: 10,
  },

  /* EXTRAS */

  extrasList: {
    gap: 11,
    marginBottom: 30,
  },

  extraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 14,
    gap: 12,
  },

  extraCardActive: {
    borderColor: 'rgba(214,173,98,0.55)',
    backgroundColor: '#171713',
  },

  extraIcon: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  extraDetails: {
    flex: 1,
  },

  extraName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },

  extraDescription: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
  },

  extraRate: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 8,
  },

  extraAction: {
    alignItems: 'center',
    gap: 8,
  },

  extraActionText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: MUTED,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },

  /* PRICE SUMMARY */

  priceCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 17,
    marginBottom: 18,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  priceLabel: {
    color: MUTED,
    fontSize: 11,
  },

  priceValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  priceDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },

  priceTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },

  priceTotalLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },

  priceTotalSub: {
    color: MUTED,
    fontSize: 9,
  },

  priceTotalValue: {
    color: GOLD_LIGHT,
    fontSize: 19,
    fontWeight: '900',
  },

  /* TRUST NOTE */

  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
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
    minHeight: 82,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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

  bottomPriceSub: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  continueButton: {
    minWidth: 145,
    height: 51,
    backgroundColor: GOLD,
    borderRadius: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  continueButtonText: {
    color: BACKGROUND,
    fontSize: 13,
    fontWeight: '900',
  },
});
