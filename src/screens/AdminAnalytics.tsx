import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeCars: 0,
    pendingPayments: 0, // Mocked for now, as we don't have a payment gateway integrated
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      // 1. Fetch Bookings (for Revenue and Count)
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price, status');

      // 2. Fetch Cars (for Active Cars count)
      const { count: carsCount, error: carsError } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

      if (bookingsError || carsError) {
        throw new Error("Failed to load analytics data");
      }

      // Calculate Total Revenue (Only from Active or Completed bookings)
      let revenue = 0;
      let pending = 0;
      
      if (bookings) {
        bookings.forEach(b => {
          if (b.status === 'active' || b.status === 'completed') {
            revenue += Number(b.total_price);
          }
          if (b.status === 'upcoming') {
            pending += Number(b.total_price);
          }
        });
      }

      setStats({
        totalBookings: bookings?.length || 0,
        totalRevenue: revenue,
        activeCars: carsCount || 0,
        pendingPayments: pending,
      });

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#0B1319', '#16232E', '#0B1319']} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.welcomeText}>Admin Overview</Text>

          {/* Top Stats Grid */}
          <View style={styles.statsGrid}>
            <BlurView intensity={20} tint="dark" style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </BlurView>

            <BlurView intensity={20} tint="dark" style={styles.statCard}>
              <Ionicons name="cash" size={24} color="#2ECC71" />
              <Text style={styles.statValue}>KES {stats.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </BlurView>
          </View>

          <View style={styles.statsGrid}>
            <BlurView intensity={20} tint="dark" style={styles.statCard}>
              <Ionicons name="car-sport" size={24} color="#F39C12" />
              <Text style={styles.statValue}>{stats.activeCars}</Text>
              <Text style={styles.statLabel}>Active Cars</Text>
            </BlurView>

            <BlurView intensity={20} tint="dark" style={styles.statCard}>
              <Ionicons name="time" size={24} color={COLORS.danger} />
              <Text style={styles.statValue}>KES {stats.pendingPayments.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pending Payments</Text>
            </BlurView>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/admin')}>
            <View style={styles.actionIcon}>
              <Ionicons name="add" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.actionText}>Add New Car</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/admin-bookings')}>
            <View style={[styles.actionIcon, { backgroundColor: '#2ECC71' }]}>
              <Ionicons name="list" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.actionText}>Manage Bookings</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 50 },
  welcomeText: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 24 },

  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard: { 
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 8, padding: 20, 
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden'
  },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginTop: 12, marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },

  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 16 },

  actionBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    padding: 16, borderRadius: 4, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' 
  },
  actionIcon: { width: 36, height: 36, borderRadius: 4, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionText: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '600' },
});