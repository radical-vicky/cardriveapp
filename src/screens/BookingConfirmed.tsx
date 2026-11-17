
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
};

const formatPrice = (amount: number) =>
  `KES ${amount.toLocaleString('en-KE')}`;

const getPickupLabel = (day?: string) => {
  if (!day) return 'Not specified';

  const date = new Date(2026, 10, Number(day));

  if (Number.isNaN(date.getTime())) return `${day} Nov 2026`;

  return date.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function BookingConfirmedScreen() {
  const router = useRouter();

  const {
    totalPrice,
    pickupDate,
    returnDate,
    carId,
    paymentMethod,
    paymentStatus,
    bookingRef,
  } = useLocalSearchParams<{
    totalPrice?: string;
    pickupDate?: string;
    returnDate?: string;
    carId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    bookingRef?: string;
  }>();

  const amount = Number(totalPrice) || 0;

  const isPaid = paymentStatus === 'paid';
  const isPending = paymentStatus === 'pending';

  const reference = bookingRef
    ? bookingRef
    : carId
      ? `PD-${String(carId).slice(0, 8).toUpperCase()}`
      : 'PENDING';

  const statusLabel = isPaid
    ? 'PAYMENT CONFIRMED'
    : isPending
      ? 'PAYMENT PENDING'
      : 'BOOKING RECEIVED';

  const statusColor = isPaid
    ? COLORS.success
    : COLORS.warning;

  const heading = isPaid
    ? 'You’re ready to go.'
    : 'Your booking is received.';

  const description = isPaid
    ? 'Your payment has been verified. Your journey starts here.'
    : 'Your booking request has been saved. Complete payment and await confirmation before your trip.';

  const handleViewBookings = () => {
    router.replace('/(tabs)/bookings');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Brand */}
        <View style={styles.topBar}>
          <View style={styles.brandMark}>
            <Ionicons name="car-sport-outline" size={20} color={COLORS.primary} />
          </View>

          <Text style={styles.brandName}>PREMIUM DRIVE</Text>

          <Text style={styles.brandCaption}>YOUR JOURNEY, ELEVATED</Text>
        </View>

        {/* Success Emblem */}
        <View style={styles.successSection}>
          <View style={styles.outerRing}>
            <View style={styles.middleRing}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isPaid ? 'checkmark' : 'car-sport-outline'}
                  size={43}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </View>

          <View style={styles.successTag}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.successTagText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <Text style={styles.title}>{heading}</Text>

          <Text style={styles.subtitle}>{description}</Text>
        </View>

        {/* Receipt */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.receiptEyebrow}>BOOKING RECEIPT</Text>
              <Text style={styles.receiptTitle}>Reservation details</Text>
            </View>

            <View style={styles.receiptIcon}>
              <Ionicons
                name="document-text-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.referenceBox}>
            <View>
              <Text style={styles.detailLabel}>BOOKING REFERENCE</Text>
              <Text style={styles.referenceValue}>{reference}</Text>
            </View>

            <Ionicons name="copy-outline" size={19} color={COLORS.primary} />
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>PICK-UP DATE</Text>
              <Text style={styles.detailValue}>
                {getPickupLabel(pickupDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="flag-outline" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>RETURN DATE</Text>
              <Text style={styles.detailValue}>
                {getPickupLabel(returnDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountSection}>
            <View>
              <Text style={styles.amountLabel}>TOTAL BOOKING AMOUNT</Text>
              <Text style={styles.amountCaption}>
                {isPaid ? 'Payment received' : 'Payment not yet verified'}
              </Text>
            </View>

            <Text style={styles.amountValue}>{formatPrice(amount)}</Text>
          </View>

          <View style={styles.paymentInfo}>
            <Ionicons
              name="wallet-outline"
              size={17}
              color={COLORS.textSecondary}
            />

            <Text style={styles.paymentInfoText}>
              Payment method: {paymentMethod === 'mpesa'
                ? 'M-Pesa'
                : paymentMethod === 'card'
                  ? 'Card'
                  : 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Next Step */}
        {!isPaid && (
          <View style={styles.nextStepCard}>
            <View style={styles.nextStepIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>What happens next?</Text>
              <Text style={styles.nextStepDescription}>
                Check your bookings for the latest reservation and payment status.
                Your booking is not payment-confirmed yet.
              </Text>
            </View>
          </View>
        )}

        {/* Brand Footer */}
        <View style={styles.footerBrand}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>THANK YOU FOR CHOOSING PREMIUM DRIVE</Text>
          <View style={styles.footerLine} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={handleViewBookings}
        >
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
          <Ionicons name="arrow-forward" size={19} color={COLORS.background} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.secondaryButton}
          onPress={handleGoHome}
        >
          <Ionicons name="home-outline" size={17} color={COLORS.textSecondary} />
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 23,
    paddingTop: 18,
    paddingBottom: 25,
  },

  topBar: {
    alignItems: 'center',
    marginBottom: 33,
  },

  brandMark: {
    width: 39,
    height: 39,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  brandName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },

  brandCaption: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 5,
  },

  successSection: {
    alignItems: 'center',
    marginBottom: 29,
  },

  outerRing: {
    width: 135,
    height: 135,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  middleRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    width: 79,
    height: 79,
    borderRadius: 40,
    backgroundColor: 'rgba(214,173,98,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  successTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },

  receiptCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
  },

  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 21,
  },

  receiptEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
  },

  receiptTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  receiptIcon: {
    width: 39,
    height: 39,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  referenceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 20,
  },

  referenceValue: {
    color: COLORS.goldLight,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 6,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
    gap: 12,
  },

  detailIcon: {
    width: 37,
    height: 37,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },

  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  amountLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  amountCaption: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 6,
  },

  amountValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
  },

  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 19,
  },

  paymentInfoText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(214,173,98,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.17)',
    padding: 15,
    marginTop: 17,
    gap: 11,
  },

  nextStepIcon: {
    paddingTop: 1,
  },

  nextStepContent: {
    flex: 1,
  },

  nextStepTitle: {
    color: COLORS.goldLight,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },

  nextStepDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
  },

  footerLine: {
    height: 1,
    width: 22,
    backgroundColor: 'rgba(214,173,98,0.35)',
  },

  footerText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  bottomBar: {
    paddingHorizontal: 23,
    paddingTop: 14,
    paddingBottom: 17,
    backgroundColor: '#101216',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },

  primaryButton: {
    minHeight: 53,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  primaryButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
