
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  Alert,
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
};

const FAQS = [
  {
    category: 'BOOKING',
    icon: 'car-outline' as const,
    question: 'How does pricing work?',
    answer:
      'Vehicle prices are calculated using the daily rental rate and the duration of your hire. Optional extras, such as chauffeur services and GPS, may add to the total. Your booking summary displays the amount before you proceed to checkout.',
  },
  {
    category: 'REQUIREMENTS',
    icon: 'document-text-outline' as const,
    question: 'What do I need to rent a vehicle?',
    answer:
      'You may be required to provide a valid driving licence, National ID or passport, and the information requested during booking. Additional verification requirements may depend on the vehicle and rental arrangement.',
  },
  {
    category: 'CANCELLATION',
    icon: 'calendar-outline' as const,
    question: 'Can I cancel my booking?',
    answer:
      'Cancellation and refund eligibility depend on the applicable booking terms and cancellation policy. Please review your booking conditions before requesting a cancellation. Contact our support team for assistance.',
  },
  {
    category: 'CHAUFFEUR',
    icon: 'person-outline' as const,
    question: 'Can I hire a vehicle with a driver?',
    answer:
      'Yes. Where available, you can select the chauffeur option on the Extras screen during the booking process. The additional charge is shown in your booking price breakdown.',
  },
  {
    category: 'PAYMENTS',
    icon: 'wallet-outline' as const,
    question: 'Which payment methods can I use?',
    answer:
      'Available payment options will be displayed during checkout. Payment availability depends on the payment providers connected to PREMIUM DRIVE.',
  },
  {
    category: 'BOOKING',
    icon: 'key-outline' as const,
    question: 'How do I view my reservations?',
    answer:
      'Open the Bookings section from the bottom navigation to view your reservations and their current status.',
  },
];

const SUPPORT_CATEGORIES = [
  {
    icon: 'car-sport-outline' as const,
    title: 'Vehicle bookings',
    description: 'Reservations and vehicle availability',
  },
  {
    icon: 'card-outline' as const,
    title: 'Payments',
    description: 'Payment questions and billing',
  },
  {
    icon: 'person-outline' as const,
    title: 'Account assistance',
    description: 'Profile and account information',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    setExpandedIndex((current) =>
      current === index ? null : index
    );
  };

  const handleContact = (channel: 'chat' | 'call') => {
    Alert.alert(
      channel === 'chat' ? 'Live Chat' : 'Phone Support',
      'Support contact details have not been configured yet. Please contact the app administrator to connect this service.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            WE'RE HERE TO HELP
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="headset-outline"
            size={24}
            color={COLORS.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="headset"
                size={30}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.heroBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.heroBadgeText}>
                CUSTOMER CARE
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            How can we{'\n'}
            <Text style={styles.goldText}>help you?</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Find answers to common questions about bookings,
            payments and your PREMIUM DRIVE experience.
          </Text>
        </View>

        {/* Support categories */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Browse by topic
            </Text>
            <Text style={styles.sectionSubtitle}>
              Find help for what you need
            </Text>
          </View>
        </View>

        <View style={styles.categoryList}>
          {SUPPORT_CATEGORIES.map((item, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>
                  {item.title}
                </Text>
                <Text style={styles.categoryDescription}>
                  {item.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.textSecondary}
              />
            </View>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Frequently Asked Questions
              </Text>
              <Text style={styles.sectionSubtitle}>
                Quick answers to common questions
              </Text>
            </View>

            <View style={styles.faqCount}>
              <Text style={styles.faqCountText}>
                {FAQS.length}
              </Text>
            </View>
          </View>

          {FAQS.map((faq, index) => {
            const expanded = expandedIndex === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqCard,
                  expanded && styles.faqCardExpanded,
                ]}
                onPress={() => toggleFaq(index)}
                activeOpacity={0.85}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqIcon}>
                    <Ionicons
                      name={faq.icon}
                      size={19}
                      color={expanded ? COLORS.primary : COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.faqQuestionContainer}>
                    <Text style={styles.faqCategory}>
                      {faq.category}
                    </Text>

                    <Text style={styles.faqQuestion}>
                      {faq.question}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.expandIcon,
                      expanded && styles.expandIconActive,
                    ]}
                  >
                    <Ionicons
                      name={expanded ? 'remove' : 'add'}
                      size={18}
                      color={expanded ? COLORS.background : COLORS.primary}
                    />
                  </View>
                </View>

                {expanded && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.faqAnswer}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contact section */}
        <View style={styles.contactSection}>
          <View style={styles.contactTop}>
            <View style={styles.contactIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.contactEyebrow}>
              PERSONAL ASSISTANCE
            </Text>
          </View>

          <Text style={styles.contactTitle}>
            Still need help?
          </Text>

          <Text style={styles.contactDescription}>
            Our support channels can help with questions about
            your bookings, account and payment arrangements.
          </Text>

          <TouchableOpacity
            style={styles.primaryContactButton}
            onPress={() => handleContact('chat')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={COLORS.background}
            />

            <Text style={styles.primaryContactText}>
              CHAT WITH SUPPORT
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.background}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryContactButton}
            onPress={() => handleContact('call')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="call-outline"
              size={19}
              color={COLORS.primary}
            />

            <Text style={styles.secondaryContactText}>
              CALL CUSTOMER CARE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons
              name="car-sport"
              size={19}
              color={COLORS.primary}
            />
            <Text style={styles.footerBrand}>
              PREMIUM DRIVE
            </Text>
          </View>

          <Text style={styles.footerText}>
            Your journey. Our priority.
          </Text>
        </View>
      </ScrollView>
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

  headerIcon: {
    width: 42,
    alignItems: 'flex-end',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 45,
  },

  hero: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 22,
    marginBottom: 30,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  heroIcon: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(214,173,98,0.08)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  badgeDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.primary,
  },

  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 39,
    letterSpacing: -0.7,
  },

  goldText: {
    color: COLORS.primary,
  },

  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  categoryList: {
    gap: 10,
    marginBottom: 31,
  },

  categoryCard: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  categoryIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.08)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  categoryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  categoryTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  categoryDescription: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },

  faqSection: {
    marginBottom: 28,
  },

  faqCount: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.09)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  faqCountText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  faqCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 10,
  },

  faqCardExpanded: {
    borderColor: COLORS.goldBorder,
    backgroundColor: '#151619',
  },

  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  faqIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
  },

  faqQuestionContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  faqCategory: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  faqQuestion: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  expandIcon: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  expandIconActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  answerContainer: {
    marginTop: 14,
  },

  answerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 13,
  },

  faqAnswer: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 21,
  },

  contactSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  contactTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 20,
  },

  contactIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  contactEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  contactTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
  },

  contactDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
    marginBottom: 20,
  },

  primaryContactButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    gap: 10,
  },

  primaryContactText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  secondaryContactButton: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginTop: 10,
    gap: 10,
  },

  secondaryContactText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 28,
  },

  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  footerBrand: {
    color: COLORS.goldLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 8,
  },
});
