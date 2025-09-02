import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Button, ScrollView, TouchableOpacity, Linking, Image, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '../../../lib/global-provider';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { IconSymbol, IconSymbolName } from '../../../components/ui/IconSymbol';
import { Models } from 'react-native-appwrite';
import { account } from '../../../lib/appwrite';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import ProfileComponent from '../../../components/Profile';



const InfoRow = ({ icon, label, value }: { icon: IconSymbolName; label: string; value: string }) => (
  <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
      <IconSymbol name={icon} size={20} color="#0a7ea4" />
    </View>
    <View className="flex-1">
      <ThemedText className="text-sm text-gray-500">{label}</ThemedText>
      <ThemedText className="text-lg font-semibold">{value}</ThemedText>
    </View>
  </View>
);

export default function Profile() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <ProfileComponent edit={false} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
