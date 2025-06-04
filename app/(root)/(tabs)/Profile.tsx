import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Button, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/lib/global-provider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Models } from 'react-native-appwrite';
import { account } from '@/lib/appwrite';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type ExtendedUser = {
  name?: string;
  email: string;
  location?: string;
  phone?: string;
}

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
  const { user, loading, refetch } = useGlobalContext();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        // TODO: Upload image to your backend/storage
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      refetch();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const handleDisableAccount = async () => {
    try {
      await account.updateStatus();
      refetch();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Disable account error:', error);
    }
  }
  
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <ThemedText className="text-lg text-gray-500">Please sign in to view your profile</ThemedText>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const userInfo: ExtendedUser = {
    name: user.name,
    email: user.email,
    location: (user as any).prefs?.location as string | undefined,
    phone: user.PhoneNumber
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1">
          <View className="p-4 bg-white border-b border-gray-200">
            <ThemedText type="title">Profile</ThemedText>
          </View>
          
          {/* Profile Image Section 
          <View className="items-center py-6 bg-white">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                  />
                ) : (
                  <IconSymbol name="person.fill" size={40} color="#9CA3AF" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                <IconSymbol name="camera.fill" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} className="mt-2">
              <ThemedText className="text-sm text-blue-600">Change Photo</ThemedText>
            </TouchableOpacity>
          </View>
          */}
          
          <View className="mt-4">
            <InfoRow
              icon="person.fill"
              label="Name"
              value={userInfo.name || 'Not set'}
            />
            <InfoRow
              icon="envelope.fill"
              label="Email"
              value={userInfo.email}
            />
            <InfoRow
              icon="location.fill"
              label="Location"
              value={userInfo.location || 'Not set'}
            />
            <InfoRow
              icon="phone.fill"
              label="Phone"
              value={userInfo.phone || 'Not set'}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Disable Account"
              onPress={handleDisableAccount}
            />
          </View>
          
          {/* Legal Links */}
          <View className="mt-8 mb-4 px-4 items-center">
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://www.rally-rank.com/terms-of-use')}
              className="mb-2"
            >
              <ThemedText className="text-sm text-blue-600 underline">Terms of Use</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://www.rally-rank.com/privacy-policy')}
            >
              <ThemedText className="text-sm text-blue-600 underline">Privacy Policy</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
});