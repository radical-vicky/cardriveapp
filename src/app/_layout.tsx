import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="admin-bookings" />
        <Stack.Screen name="admin-analytics" />
        <Stack.Screen name="car-details" />
        <Stack.Screen name="booking-dates" />
        <Stack.Screen name="booking-extras" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="booking-confirmed" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="payment-methods" />
        <Stack.Screen name="help-support" />
      </Stack>
    </SafeAreaProvider>
  );
}