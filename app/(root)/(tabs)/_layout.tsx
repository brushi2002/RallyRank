import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          android: {
            // Ensure the tab bar is visible and properly positioned on Android
            position: 'relative',
            elevation: 8,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sportscourt.fill" color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="LadderStandings"
        options={{
          title: 'Ladder Standings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="EnterScore"
        options={{
          title: 'Enter Score',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          headerShown: false,
        }}
      />
       <Tabs.Screen
        name="CreateLadder"
        options={{
          title: 'Create Ladder',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
    
  );
}
