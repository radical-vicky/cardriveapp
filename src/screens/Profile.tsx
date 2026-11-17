
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
const SURFACE = '#141619';
const SURFACE_LIGHT = '#1B1E22';
const MUTED = '#92949A';
const WHITE = '#FFFFFF';
const RED = '#E47777';

type ProfileUser = {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  showDivider?: boolean;
  badge?: string;
};

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showDivider = true,
  badge,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.menuItem}
      onPress={onPress}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={21} color={GOLD} />
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#777B80"
      />

      {showDivider && <View style={styles.menuDivider} />}
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!currentUser) {
        setUser(null);
        router.replace('/login');
        return;
      }

      setUser(currentUser as ProfileUser);
    } catch (error) {
      console.log('Profile loading error:', error);
      Alert.alert(
        'Unable to load profile',
        'Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUser();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Premium Drive account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            if (loggingOut) return;

            setLoggingOut(true);

            try {
              const { error } = await supabase.auth.signOut();

              if (error) throw error;

              router.replace('/login');
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert(
                'Logout failed',
                'We could not log you out. Please try again.'
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const fullName =
    user?.user_metadata?.full_name?.trim() || 'Premium Driver';

  const email = user?.email || 'No email available';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-KE', {
        month: 'long',
        year: 'numeric',
      })
    : 'Premium member';

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BACKGROUND}
        />

        <ActivityIndicator size="large" color={GOLD} />

        <Text style={styles.loadingText}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BACKGROUND}
      />

      <LinearGradient
        colors={['#17130E', '#090A0C', '#050505']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={GOLD}
              colors={[GOLD]}
              progressBackgroundColor={SURFACE}
            />
          }
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>
                PREMIUM DRIVE
              </Text>

              <Text style={styles.headerTitle}>
                My Profile
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={GOLD}
              />
            </TouchableOpacity>
          </View>

          {/* PROFILE HERO */}
          <View style={styles.profileHero}>
            <LinearGradient
              colors={['#302718', '#1A1711', '#111315']}
              style={styles.profileHeroGradient}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.memberBadge}>
                  <Ionicons
                    name="diamond"
                    size={12}
                    color={GOLD}
                  />

                  <Text style={styles.memberBadgeText}>
                    PREMIUM MEMBER
                  </Text>
                </View>

                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color={GOLD}
                />
              </View>

              <View style={styles.profileIdentity}>
                <View style={styles.avatarOuter}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarInitials}>
                      {initials || 'PD'}
                    </Text>
                  </View>

                  <View style={styles.avatarStatus}>
                    <Ionicons
                      name="checkmark"
                      size={11}
                      color="#111315"
                    />
                  </View>
                </View>

                <View style={styles.identityDetails}>
                  <Text
                    style={styles.userName}
                    numberOfLines={1}
                  >
                    {fullName}
                  </Text>

                  <Text
                    style={styles.userEmail}
                    numberOfLines={1}
                  >
                    {email}
                  </Text>

                  <View style={styles.memberSince}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={GOLD}
                    />

                    <Text style={styles.memberSinceText}>
                      Member since {memberSince}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroDivider} />

              <TouchableOpacity
                style={styles.editProfileButton}
                activeOpacity={0.8}
                onPress={() => router.push('/edit-profile')}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color="#17120A"
                />

                <Text style={styles.editProfileText}>
                  EDIT PROFILE
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color="#17120A"
                />
              </TouchableOpacity>

              <View style={styles.heroDecoration}>
                <Ionicons
                  name="car-sport"
                  size={115}
                  color="rgba(214,173,98,0.07)"
                />
              </View>
            </LinearGradient>
          </View>

          {/* ACCOUNT SECTION */}
          <SectionHeader
            title="Your Account"
            subtitle="Manage your personal information"
          />

          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Personal Information"
              subtitle="Update your name and account details"
              onPress={() => router.push('/edit-profile')}
            />

            <MenuItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your payment preferences"
              onPress={() => router.push('/payment-methods')}
            />

            <MenuItem
              icon="document-text-outline"
              title="My Documents"
              subtitle="Manage your driving documents"
              onPress={() => router.push('/documents')}
              showDivider={false}
            />
          </View>

          {/* BOOKINGS SECTION */}
          <SectionHeader
            title="My Activities"
            subtitle="Keep track of your car hire experience"
          />

          <View style={styles.menuContainer}>
            <MenuItem
              icon="calendar-outline"
              title="My Bookings"
              subtitle="View upcoming and previous bookings"
              onPress={() => router.push('/(tabs)/bookings')}
            />

            <MenuItem
              icon="car-outline"
              title="Explore Vehicles"
              subtitle="Find your next premium ride"
              onPress={() => router.push('/(tabs)/home')}
              showDivider={false}
            />
          </View>

          {/* SUPPORT SECTION */}
          <SectionHeader
            title="Support & Assistance"
            subtitle="We're here to help"
          />

          <View style={styles.menuContainer}>
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get assistance with your bookings"
              onPress={() => router.push('/help-support')}
            />

            <MenuItem
              icon="chatbubble-ellipses-outline"
              title="Contact Us"
              subtitle="Talk to the Premium Drive team"
              onPress={() => router.push('/help-support')}
              showDivider={false}
            />
          </View>

          {/* ACCOUNT SECURITY */}
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={GOLD}
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>
                Your account matters
              </Text>

              <Text style={styles.securityDescription}>
                Keep your contact information and driving
                documents up to date for a smoother
                booking experience.
              </Text>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color={RED} />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={RED}
                />

                <Text style={styles.logoutText}>
                  Log Out
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Text style={styles.footerBrand}>
              PREMIUM DRIVE
            </Text>

            <Text style={styles.footerTagline}>
              DRIVE IN STYLE. ARRIVE IN CLASS.
            </Text>

            <Text style={styles.versionText}>
              Your journey. Your experience.
            </Text>
          </View>

          <View style={{ height: 35 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  safeArea: {
    flex: 1,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 23,
  },

  headerEyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 6,
  },

  headerTitle: {
    color: WHITE,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  headerButton: {
    width: 43,
    height: 43,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.3)',
    backgroundColor: 'rgba(214,173,98,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // PROFILE HERO
  profileHero: {
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.4)',
    overflow: 'hidden',
    marginBottom: 31,
  },

  profileHeroGradient: {
    padding: 19,
    minHeight: 240,
    overflow: 'hidden',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.35)',
    backgroundColor: 'rgba(214,173,98,0.10)',
  },

  memberBadgeText: {
    color: GOLD_LIGHT,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  profileIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 27,
  },

  avatarOuter: {
    width: 77,
    height: 77,
    borderWidth: 1,
    borderColor: GOLD,
    padding: 4,
    position: 'relative',
  },

  avatar: {
    flex: 1,
    backgroundColor: 'rgba(214,173,98,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitials: {
    color: GOLD_LIGHT,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 1,
  },

  avatarStatus: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 20,
    height: 20,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1711',
  },

  identityDetails: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    color: WHITE,
    fontSize: 19,
    fontWeight: '900',
  },

  userEmail: {
    color: '#B8B8B8',
    fontSize: 11,
    marginTop: 5,
  },

  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },

  memberSinceText: {
    color: GOLD_LIGHT,
    fontSize: 10,
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 22,
    marginBottom: 14,
  },

  editProfileButton: {
    height: 43,
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 17,
    zIndex: 2,
  },

  editProfileText: {
    color: '#17120A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroDecoration: {
    position: 'absolute',
    right: -13,
    bottom: 12,
  },

  // SECTION HEADERS
  sectionHeader: {
    marginBottom: 13,
  },

  sectionTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  // MENU
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 28,
  },

  menuItem: {
    minHeight: 76,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },

  menuIcon: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuContent: {
    flex: 1,
    minWidth: 0,
  },

  menuTitle: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },

  menuSubtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },

  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(214,173,98,0.12)',
  },

  menuBadgeText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
  },

  menuDivider: {
    position: 'absolute',
    bottom: 0,
    left: 67,
    right: 13,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // SECURITY CARD
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    padding: 16,
    backgroundColor: 'rgba(214,173,98,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.22)',
    marginBottom: 23,
  },

  securityIcon: {
    width: 39,
    height: 39,
    backgroundColor: 'rgba(214,173,98,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: GOLD_LIGHT,
    fontSize: 12,
    fontWeight: '800',
  },

  securityDescription: {
    color: '#AAAAAA',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 5,
  },

  // LOGOUT
  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(228,119,119,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(228,119,119,0.28)',
  },

  logoutText: {
    color: RED,
    fontSize: 13,
    fontWeight: '800',
  },

  // FOOTER
  footer: {
    alignItems: 'center',
    marginTop: 33,
  },

  footerLine: {
    width: 42,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 13,
  },

  footerBrand: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
  },

  footerTagline: {
    color: '#B0B0B0',
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 7,
  },

  versionText: {
    color: '#62666A',
    fontSize: 9,
    marginTop: 12,
  },
});
