
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  goldBorder: 'rgba(214,173,98,0.25)',
  danger: '#E47777',
};

type PaymentMethod = {
  id: string;
  type: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  badge?: string;
};

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'M-Pesa',
      detail: '0712 *** 678',
      icon: 'phone-portrait-outline',
      description: 'Mobile money',
      badge: 'MOCK',
    },
    {
      id: '2',
      type: 'Visa',
      detail: '**** **** **** 1234',
      icon: 'card-outline',
      description: 'Debit / Credit Card',
      badge: 'MOCK',
    },
  ]);

  const handleDelete = (id: string, type: string) => {
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove ${type} from this list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMethods((previous) =>
              previous.filter((method) => method.id !== id)
            );
          },
        },
      ]
    );
  };

  const handleAddMethod = () => {
    Alert.alert(
      'Payment Integration Coming Soon',
      'Adding and securely saving payment methods will be available once the payment provider integration is connected.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const renderMethodIcon = (method: PaymentMethod) => {
    return (
      <View style={styles.methodIcon}>
        <Ionicons
          name={method.icon}
          size={25}
          color={COLORS.primary}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>PAYMENT PREFERENCES</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="wallet-outline"
            size={24}
            color={COLORS.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.eyebrow}>YOUR PAYMENTS</Text>

          <Text style={styles.mainTitle}>
            Payment made{'\n'}
            <Text style={styles.goldText}>simple.</Text>
          </Text>

          <Text style={styles.introDescription}>
            Manage your preferred payment options for a smooth
            vehicle booking experience.
          </Text>
        </View>

        {/* Payment overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View>
              <Text style={styles.overviewLabel}>SAVED METHODS</Text>
              <Text style={styles.overviewNumber}>
                {String(methods.length).padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.overviewIcon}>
              <Ionicons
                name="wallet"
                size={27}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewBottom}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.overviewFootnote}>
              Manage your available payment options below.
            </Text>
          </View>
        </View>

        {/* Methods heading */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your Methods</Text>
            <Text style={styles.sectionSubtitle}>
              Available payment options
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{methods.length}</Text>
          </View>
        </View>

        {/* Payment methods */}
        {methods.length > 0 ? (
          methods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodTop}>
                <View style={styles.methodLeft}>
                  {renderMethodIcon(method)}

                  <View style={styles.methodInfo}>
                    <Text style={styles.methodType}>
                      {method.type}
                    </Text>

                    <Text style={styles.methodDescription}>
                      {method.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.methodRight}>
                  {method.badge && (
                    <View style={styles.mockBadge}>
                      <Text style={styles.mockBadgeText}>
                        {method.badge}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(method.id, method.type)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Remove ${method.type}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={COLORS.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.methodDivider} />

              <View style={styles.methodBottom}>
                <View>
                  <Text style={styles.detailLabel}>
                    PAYMENT DETAILS
                  </Text>
                  <Text style={styles.methodDetail}>
                    {method.detail}
                  </Text>
                </View>

                <View style={styles.securityIndicator}>
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color={COLORS.success}
                  />
                  <Text style={styles.securityIndicatorText}>
                    DEMO
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="wallet-outline"
                size={34}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Payment Methods
            </Text>

            <Text style={styles.emptyDescription}>
              Your payment methods will appear here when they
              are added through a supported payment provider.
            </Text>

            <TouchableOpacity
              style={styles.emptyAction}
              onPress={handleAddMethod}
            >
              <Text style={styles.emptyActionText}>
                Learn About Payment Setup
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security information */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Your security matters
            </Text>

            <Text style={styles.securityDescription}>
              Real payment details should be handled by a
              trusted payment provider. PREMIUM DRIVE should
              never store raw card numbers or CVV codes.
            </Text>
          </View>
        </View>

        {/* Supported options */}
        <View style={styles.supportedSection}>
          <Text style={styles.supportedTitle}>
            PAYMENT OPTIONS
          </Text>

          <View style={styles.supportedRow}>
            <View style={styles.supportedItem}>
              <Ionicons
                name="phone-portrait-outline"
                size={19}
                color={COLORS.primary}
              />
              <Text style={styles.supportedText}>M-Pesa</Text>
            </View>

            <View style={styles.supportedItem}>
              <Ionicons
                name="card-outline"
                size={19}
                color={COLORS.primary}
              />
              <Text style={styles.supportedText}>Cards</Text>
            </View>

            <View style={styles.supportedItem}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.primary}
              />
              <Text style={styles.supportedText}>Secure</Text>
            </View>
          </View>

          <Text style={styles.supportedNote}>
            These are intended payment options, not confirmation
            that payment processing is connected.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMethod}
          activeOpacity={0.85}
        >
          <Ionicons
            name="add"
            size={21}
            color={COLORS.background}
          />

          <Text style={styles.addButtonText}>
            ADD PAYMENT METHOD
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          PREMIUM DRIVE · SECURE BOOKING EXPERIENCE
        </Text>
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
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  headerRight: {
    width: 42,
    alignItems: 'flex-end',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },

  introSection: {
    marginBottom: 23,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 10,
  },

  mainTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 39,
    letterSpacing: -0.8,
  },

  goldText: {
    color: COLORS.primary,
  },

  introDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 310,
  },

  overviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 19,
    marginBottom: 30,
  },

  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overviewLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  overviewNumber: {
    color: COLORS.goldLight,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 5,
  },

  overviewIcon: {
    width: 53,
    height: 53,
    backgroundColor: 'rgba(214,173,98,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  overviewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  overviewBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  overviewFootnote: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  countBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  countText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  methodCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 13,
  },

  methodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  methodIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.09)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  methodInfo: {
    marginLeft: 13,
    flex: 1,
  },

  methodType: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  methodDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  mockBadge: {
    backgroundColor: 'rgba(230,182,92,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(230,182,92,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  mockBadgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  deleteButton: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(228,119,119,0.08)',
  },

  methodDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  methodBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  methodDetail: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },

  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  securityIndicatorText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.09)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginBottom: 17,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  emptyDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 9,
  },

  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  emptyActionText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(214,173,98,0.055)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 16,
    marginTop: 20,
    gap: 13,
  },

  securityIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.10)',
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: COLORS.goldLight,
    fontSize: 13,
    fontWeight: '700',
  },

  securityDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  supportedSection: {
    marginTop: 28,
    marginBottom: 10,
  },

  supportedTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  supportedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 9,
  },

  supportedItem: {
    flex: 1,
    minHeight: 65,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },

  supportedText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },

  supportedNote: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  addButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    gap: 10,
  },

  addButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  footerNote: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 12,
  },
});
