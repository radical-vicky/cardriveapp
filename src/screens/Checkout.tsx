
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
};

type PaymentMethod = 'mpesa' | 'card';

const formatPrice = (amount: number) =>
  `KES ${amount.toLocaleString('en-KE')}`;

const getDateLabel = (day: string | undefined) => {
  if (!day) return 'Not selected';

  const date = new Date(2026, 10, Number(day));
  if (Number.isNaN(date.getTime())) return `${day} Nov`;

  const weekday = date.toLocaleDateString('en-KE', {
    weekday: 'short',
  });

  return `${weekday}, ${Number(day)} Nov 2026`;
};

export default function CheckoutScreen() {
  const router = useRouter();

  const {
    id,
    pickupDate,
    returnDate,
    days,
    totalPrice,
    hasChauffeur,
    hasGps,
    hasChildSeat,
  } = useLocalSearchParams<{
    id?: string;
    pickupDate?: string;
    returnDate?: string;
    days?: string;
    totalPrice?: string;
    hasChauffeur?: string;
    hasGps?: string;
    hasChildSeat?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('mpesa');

  const duration = Math.max(1, Number(days) || 1);
  const amount = Number(totalPrice) || 0;

  const chauffeurSelected = hasChauffeur === 'true';
  const gpsSelected = hasGps === 'true';
  const childSeatSelected = hasChildSeat === 'true';

  const selectedExtras = [
    chauffeurSelected ? 'Chauffeur service' : null,
    gpsSelected ? 'GPS navigation' : null,
    childSeatSelected ? 'Child safety seat' : null,
  ].filter(Boolean) as string[];

  const handlePayment = async () => {
    if (!id) {
      Alert.alert('Missing vehicle', 'Please return and select a vehicle.');
      return;
    }

    if (!pickupDate || !returnDate) {
      Alert.alert('Missing dates', 'Please select your rental dates.');
      return;
    }

    if (amount <= 0) {
      Alert.alert('Invalid amount', 'The booking total is invalid.');
      return;
    }

    if (!isChecked) {
      Alert.alert(
        'Terms Required',
        'Please agree to the Terms of Service and Cancellation Policy.',
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error('You must be logged in to make a booking.');
      }

      // Save the booking request.
      // Payment is NOT processed by this insert.
      const { error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          car_id: id,
          pickup_date: getDateLabel(pickupDate),
          return_date: getDateLabel(returnDate),
          total_price: amount,
          drive_type: chauffeurSelected
            ? 'With Chauffeur'
            : 'Self Drive',
          status: 'upcoming',
        },
      ]);

      if (error) throw error;

      // This is a booking confirmation step, not a real payment.
      router.replace({
        pathname: '/booking-confirmed',
        params: {
          totalPrice: String(amount),
          pickupDate,
          returnDate,
          carId: id,
          paymentMethod,
          paymentStatus: 'pending',
        },
      });
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>FINAL STEP</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="shield-checkmark-outline" size={21} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={styles.progressCompleted}>
              <Ionicons name="checkmark" size={13} color={COLORS.background} />
            </View>
            <Text style={styles.progressText}>Dates</Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View style={styles.progressCompleted}>
              <Ionicons name="checkmark" size={13} color={COLORS.background} />
            </View>
            <Text style={styles.progressText}>Extras</Text>
          </View>

          <View style={styles.progressLineActive} />

          <View style={styles.progressStep}>
            <View style={styles.progressCurrent}>
              <Text style={styles.progressNumber}>3</Text>
            </View>
            <Text style={styles.progressTextActive}>Checkout</Text>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>ALMOST THERE</Text>
          <Text style={styles.title}>Review your booking.</Text>
          <Text style={styles.description}>
            Confirm your rental details and choose your preferred payment method.
          </Text>
        </View>

        {/* Booking Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>YOUR RESERVATION</Text>
              <Text style={styles.cardTitle}>Booking summary</Text>
            </View>

            <View style={styles.secureTag}>
              <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
              <Text style={styles.secureTagText}>REVIEW</Text>
            </View>
          </View>

          <View style={styles.dateBlock}>
            <View style={styles.dateIcon}>
              <Ionicons name="calendar-outline" size={19} color={COLORS.primary} />
            </View>

            <View style={styles.dateDetails}>
              <Text style={styles.detailLabel}>PICK-UP</Text>
              <Text style={styles.dateValue}>{getDateLabel(pickupDate)}</Text>
              <Text style={styles.timeText}>09:00 AM</Text>
            </View>
          </View>

          <View style={styles.dateConnector}>
            <View style={styles.connectorLine} />
            <Text style={styles.durationText}>{duration} rental days</Text>
          </View>

          <View style={styles.dateBlock}>
            <View style={styles.dateIcon}>
              <Ionicons name="flag-outline" size={19} color={COLORS.primary} />
            </View>

            <View style={styles.dateDetails}>
              <Text style={styles.detailLabel}>RETURN</Text>
              <Text style={styles.dateValue}>{getDateLabel(returnDate)}</Text>
              <Text style={styles.timeText}>09:00 AM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental duration</Text>
            <Text style={styles.summaryValue}>
              {duration} {duration === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Drive type</Text>
            <Text style={styles.summaryValue}>
              {chauffeurSelected ? 'With Chauffeur' : 'Self Drive'}
            </Text>
          </View>

          {selectedExtras.length > 0 && (
            <View style={styles.extrasSection}>
              <Text style={styles.detailLabel}>SELECTED EXTRAS</Text>

              {selectedExtras.map((extra) => (
                <View key={extra} style={styles.extraRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={COLORS.primary}
                  />
                  <Text style={styles.extraText}>{extra}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL BOOKING AMOUNT</Text>
              <Text style={styles.totalCaption}>Inclusive of selected extras</Text>
            </View>

            <Text style={styles.totalValue}>{formatPrice(amount)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionHeading}>
          <Text style={styles.cardTitle}>Payment method</Text>
          <Text style={styles.optionalText}>SELECT ONE</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPaymentMethod('mpesa')}
          style={[
            styles.paymentCard,
            paymentMethod === 'mpesa' && styles.paymentCardActive,
          ]}
        >
          <View style={styles.paymentIcon}>
            <Ionicons name="phone-portrait-outline" size={23} color={COLORS.primary} />
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.paymentName}>M-Pesa</Text>
            <Text style={styles.paymentDescription}>
              Mobile money payment
            </Text>
          </View>

          <View style={[
            styles.radio,
            paymentMethod === 'mpesa' && styles.radioActive,
          ]}>
            {paymentMethod === 'mpesa' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPaymentMethod('card')}
          style={[
            styles.paymentCard,
            paymentMethod === 'card' && styles.paymentCardActive,
          ]}
        >
          <View style={styles.paymentIcon}>
            <Ionicons name="card-outline" size={23} color={COLORS.primary} />
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.paymentName}>Credit / Debit Card</Text>
            <Text style={styles.paymentDescription}>
              Visa and Mastercard
            </Text>
          </View>

          <View style={[
            styles.radio,
            paymentMethod === 'card' && styles.radioActive,
          ]}>
            {paymentMethod === 'card' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Payment Notice */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={19} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            Payment processing must be connected before this booking flow can collect money.
            Selecting a payment method here does not initiate a charge.
          </Text>
        </View>

        {/* Terms */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.termsContainer}
          onPress={() => setIsChecked(!isChecked)}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
            {isChecked && (
              <Ionicons name="checkmark" size={15} color={COLORS.background} />
            )}
          </View>

          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and <Text style={styles.termsLink}>Cancellation Policy</Text>.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomAmount}>{formatPrice(amount)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
            </>
          )}
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

  header: {
    height: 62,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 3,
  },

  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 150,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },

  progressStep: {
    alignItems: 'center',
    gap: 7,
  },

  progressCompleted: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCurrent: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressNumber: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    marginHorizontal: 9,
    marginBottom: 20,
  },

  progressLineActive: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    marginHorizontal: 9,
    marginBottom: 20,
  },

  progressText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },

  progressTextActive: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  intro: {
    marginBottom: 25,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 10,
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 29,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  cardEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 7,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(98,201,154,0.08)',
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  secureTagText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  dateIcon: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(214,173,98,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateDetails: {
    flex: 1,
  },

  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  dateValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  timeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  dateConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    height: 34,
    gap: 12,
  },

  connectorLine: {
    height: 24,
    width: 1,
    backgroundColor: 'rgba(214,173,98,0.35)',
  },

  durationText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 19,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  summaryValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },

  extrasSection: {
    marginTop: 7,
    gap: 11,
  },

  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  extraText: {
    color: COLORS.text,
    fontSize: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  totalCaption: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },

  totalValue: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  optionalText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 11,
  },

  paymentCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(214,173,98,0.055)',
  },

  paymentIcon: {
    width: 43,
    height: 43,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  paymentDetails: {
    flex: 1,
  },

  paymentName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  paymentDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(214,173,98,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.17)',
    padding: 13,
    marginTop: 9,
  },

  noticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 8,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
  },

  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#101216',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  bottomPrice: {
    flex: 1,
  },

  bottomLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  bottomAmount: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
  },

  payButton: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  payButtonDisabled: {
    opacity: 0.65,
  },

  payButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
  },
});
