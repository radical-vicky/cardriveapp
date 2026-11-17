
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS } from '@/constants/theme';

const GOLD = '#D6AD62';
const INACTIVE = '#85878D';
const TAB_BACKGROUND = 'rgba(12, 13, 15, 0.94)';
const BORDER = 'rgba(214, 173, 98, 0.16)';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: INACTIVE,

        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 3,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },

        tabBarIconStyle: {
          marginTop: 5,
        },

        tabBarItemStyle: {
          paddingVertical: 4,
        },

        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Platform.OS === 'ios' ? 20 : 12,

          height: Platform.OS === 'ios' ? 72 : 66,

          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 8 : 5,

          backgroundColor: 'transparent',
          borderTopWidth: 0,

          // Sharp square corners
          borderRadius: 0,

          elevation: 0,

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },

        tabBarBackground: () => (
          <View style={styles.backgroundContainer}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 45 : 35}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                StyleSheet.absoluteFill,
                styles.backgroundOverlay,
              ]}
            />

            <View style={styles.topBorder} />
          </View>
        ),

        sceneStyle: {
          backgroundColor: COLORS.background || '#08090B',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    overflow: 'hidden',

    // Completely square corners
    borderRadius: 0,

    backgroundColor: TAB_BACKGROUND,
    borderWidth: 1,
    borderColor: BORDER,
  },

  backgroundOverlay: {
    backgroundColor: 'rgba(10, 11, 13, 0.68)',
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(240, 216, 165, 0.20)',
  },
});
