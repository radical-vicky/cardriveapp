import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

// Palette: milky white glass on a dark blue-grey base,
// with red, green and blue-grey accents.
const RED = '#D4585D';
const GREEN = '#4CC38A';
const MINT = '#9FE0C0';
const BLUE_GREY = '#8FB0C2';
const MILK = 'rgba(244,246,245,0.14)';
const MILK_BORDER = 'rgba(255,255,255,0.32)';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/landing');
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* BACKGROUND IMAGE */}
      <Image
        source={require('../../assets/images/splash-car.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* DARK BLUE-GREY IMAGE OVERLAY */}
      <View pointerEvents="none" style={styles.darkOverlay} />

      {/* COLOUR GLOWS: red top-left, green right, blue-grey bottom */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(212,88,93,0.55)', 'rgba(212,88,93,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.5 }}
        style={styles.glow}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(76,195,138,0)', 'rgba(76,195,138,0.38)']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 1, y: 0.75 }}
        style={styles.glow}
      />

      {/* BOTTOM FADE INTO DARK */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11,16,21,0)', 'rgba(11,16,21,0.94)']}
        style={styles.bottomOverlay}
      />

      {/* FOREGROUND CONTENT */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>

          {/* BRAND */}
          <View style={styles.logoContainer}>
            <BlurView intensity={40} tint="light" style={styles.logoRing}>
              <Text style={styles.logoText}>DriveLux</Text>
            </BlurView>

            <Text style={styles.subtitle}>
              RENT  •  DRIVE  •  EXPLORE
            </Text>
          </View>

          {/* BOTTOM TAGLINE */}
          <BlurView intensity={45} tint="light" style={styles.bottomContainer}>
            <View style={styles.divider}>
              <View style={[styles.dividerBar, { backgroundColor: RED }]} />
              <View style={[styles.dividerBar, { backgroundColor: GREEN }]} />
              <View style={[styles.dividerBar, { backgroundColor: BLUE_GREY }]} />
            </View>

            <Text style={styles.tagline}>
              Premium Cars.
            </Text>

            <Text style={styles.taglineBold}>
              Unforgettable Journeys.
            </Text>

            <Text style={styles.loadingText}>
              PREPARING YOUR EXPERIENCE
            </Text>

            <View style={styles.loadingTrack}>
              <View style={styles.loadingProgress} />
            </View>
          </BlurView>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1015',
    position: 'relative',
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,20,26,0.55)',
    zIndex: 1,
  },

  glow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    zIndex: 2,
  },

  safeArea: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.09,
    paddingBottom: 28,
  },

  logoContainer: {
    alignItems: 'center',
  },

  // Frosted milky-glass pill
  logoRing: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: MILK_BORDER,
    backgroundColor: MILK,
    overflow: 'hidden',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 5,
    marginTop: 18,
  },

  // Frosted milky-glass card
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: MILK_BORDER,
    backgroundColor: MILK,
    overflow: 'hidden',
  },

  divider: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },

  dividerBar: {
    width: 20,
    height: 3,
    borderRadius: 0,
  },

  tagline: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  taglineBold: {
    color: MINT,
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },

  loadingText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 32,
  },

  loadingTrack: {
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 12,
    borderRadius: 0,
    overflow: 'hidden',
  },

  loadingProgress: {
    width: '65%',
    height: '100%',
    backgroundColor: MINT,
  },
});