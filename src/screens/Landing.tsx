
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#08090B',
  gold: '#D6AD62',
  goldLight: '#F0D8A5',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.68)',
  border: 'rgba(255,255,255,0.16)',
};

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

      {/* CINEMATIC BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require('../../assets/images/landing-car.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <LinearGradient
          colors={[
            'rgba(5,6,8,0.28)',
            'rgba(5,6,8,0.08)',
            'rgba(5,6,8,0.60)',
            '#08090B',
          ]}
          locations={[0, 0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            'rgba(214,173,98,0.12)',
            'rgba(214,173,98,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.goldGlow}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* BRAND HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.brandMark}>
              <Ionicons
                name="car-sport-outline"
                size={25}
                color={COLORS.gold}
              />
            </View>

            <View>
              <Text style={styles.brandName}>PREMIUM DRIVE</Text>
              <Text style={styles.brandCaption}>EXPERIENCE THE DIFFERENCE</Text>
            </View>
          </View>

          <View style={styles.headerTag}>
            <View style={styles.headerDot} />
            <Text style={styles.headerTagText}>PREMIUM MOBILITY</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {/* HERO CONTENT */}
        <View style={styles.heroContent}>
          <View style={styles.eyebrowContainer}>
            <View style={styles.eyebrowLine} />
            <Text style={styles.eyebrow}>YOUR JOURNEY. YOUR STYLE.</Text>
          </View>

          <Text style={styles.title}>
            Arrive in
            {'\n'}
            <Text style={styles.titleGold}>style.</Text>
            {' '}
            Every
            {'\n'}
            moment.
          </Text>

          <Text style={styles.subtitle}>
            Discover exceptional cars for life's most memorable occasions.
            Choose your ride, set your plans, and enjoy the journey.
          </Text>

          {/* EXPERIENCE HIGHLIGHTS */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons
                name="car-outline"
                size={17}
                color={COLORS.gold}
              />
              <Text style={styles.featureText}>Premium cars</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.feature}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color={COLORS.gold}
              />
              <Text style={styles.featureText}>Flexible booking</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.feature}>
              <Ionicons
                name="key-outline"
                size={17}
                color={COLORS.gold}
              />
              <Text style={styles.featureText}>Self-drive</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM ACTION AREA */}
        <View style={styles.bottomSection}>
          <View style={styles.topDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerAccent} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.actionHeading}>
            Find the perfect car for your next journey.
          </Text>

          {/* PRIMARY ACTION */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.primaryButtonText}>Get started</Text>
            <View style={styles.buttonIcon}>
              <Ionicons
                name="arrow-forward"
                size={19}
                color={COLORS.background}
              />
            </View>
          </TouchableOpacity>

          {/* SECONDARY ACTION */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.secondaryButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?
            </Text>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={COLORS.gold}
            />
            <Text style={styles.footerText}>
              A better way to experience every journey.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
  },

  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },

  goldGlow: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  brandMark: {
    width: 43,
    height: 43,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.55)',
    backgroundColor: 'rgba(8,9,11,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  brandCaption: {
    color: COLORS.gold,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 4,
  },

  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(8,9,11,0.50)',
    paddingHorizontal: 9,
    paddingVertical: 8,
    gap: 6,
  },

  headerDot: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.gold,
  },

  headerTagText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  spacer: {
    flex: 1,
    minHeight: 45,
  },

  heroContent: {
    marginBottom: 28,
  },

  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 17,
  },

  eyebrowLine: {
    width: 27,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  title: {
    color: COLORS.white,
    fontSize: Math.min(width * 0.115, 48),
    fontWeight: '900',
    lineHeight: Math.min(width * 0.13, 55),
    letterSpacing: -1.5,
  },

  titleGold: {
    color: COLORS.gold,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 17,
    maxWidth: 340,
    fontWeight: '400',
  },

  features: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 23,
    gap: 10,
    flexWrap: 'wrap',
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  featureText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },

  featureDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
  },

  topDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  dividerAccent: {
    width: 28,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  actionHeading: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 17,
  },

  primaryButton: {
    height: 58,
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  primaryButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  buttonIcon: {
    position: 'absolute',
    right: 17,
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8,9,11,0.28)',
  },

  secondaryButton: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    marginTop: 11,
  },

  secondaryButtonText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },

  loginLink: {
    color: COLORS.goldLight,
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 21,
  },

  footerText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
