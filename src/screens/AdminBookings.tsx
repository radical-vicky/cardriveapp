import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function AdminBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    // Explicitly joining profiles using the foreign key we created
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars (name, image_url),
        profiles!fk_bookings_profiles (full_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.log("Error fetching bookings:", error);
      Alert.alert('Error', error.message);
    }
    
    if (data) setBookings(data);
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', `Booking marked as ${newStatus}`);
      fetchAllBookings(); // Refresh the list
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return '#F39C12'; // Orange
      case 'active': return COLORS.primary; // Blue
      case 'completed': return '#2ECC71'; // Green
      case 'cancelled': return COLORS.danger; // Red
      default: return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No bookings found.</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              
              {/* Header: Customer Info & Status */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.customerName}>{booking.profiles?.full_name || 'Unknown User'}</Text>
                  <Text style={styles.customerContact}>{booking.profiles?.phone} | {booking.profiles?.email}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Car Info */}
              <View style={styles.carRow}>
                <Image source={{ uri: booking.cars?.image_url }} style={styles.carImage} />
                <View style={styles.carDetails}>
                  <Text style={styles.carName}>{booking.cars?.name}</Text>
                  <Text style={styles.carDates}>{booking.pickup_date} to {booking.return_date}</Text>
                  <Text style={styles.priceText}>KES {Number(booking.total_price).toLocaleString()}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {booking.status === 'upcoming' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(booking.id, 'active')}>
                    <Text style={styles.actionBtnText}>Mark as Active</Text>
                  </TouchableOpacity>
                )}
                {booking.status === 'active' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2ECC71' }]} onPress={() => updateStatus(booking.id, 'completed')}>
                    <Text style={styles.actionBtnText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => updateStatus(booking.id, 'cancelled')}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 50 },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },

  bookingCard: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 4, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  customerName: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  customerContact: { color: COLORS.textSecondary, fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  statusText: { fontSize: 12, fontWeight: '800' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },

  carRow: { flexDirection: 'row', marginBottom: 16 },
  carImage: { width: 80, height: 60, borderRadius: 4, marginRight: 12 },
  carDetails: { flex: 1, justifyContent: 'center' },
  carName: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  carDates: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  priceText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 4, alignItems: 'center' },
  actionBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  cancelBtn: { backgroundColor: 'rgba(231, 76, 60, 0.1)', borderWidth: 1, borderColor: 'rgba(231, 76, 60, 0.3)' },
  cancelBtnText: { color: COLORS.danger, fontSize: 13, fontWeight: '700' },
});