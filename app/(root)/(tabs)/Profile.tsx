import React from 'react';
import { View, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/lib/global-provider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Models } from 'react-native-appwrite';
import { account } from '@/lib/appwrite';
import { router } from 'expo-router';

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
    phone: (user as any).prefs?.phone as string | undefined,
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4 bg-white border-b border-gray-200">
          <ThemedText type="title">Profile</ThemedText>
        </View>
        
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
