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


type ExtendedUser = {
  name?: string;
  email: string;
  location?: string;
  phone?: string;
  wins: number;
  losses: number;
  leagueinfo?: any;
  rank: number;
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
    phone: user.PhoneNumber,
    wins: user.leagueinfo.wins,
    losses: user.leagueinfo.losses,
    rank: user.leagueinfo.rank
  };

  return (
  <SafeAreaView style={styles.container}>
  <ScrollView showsVerticalScrollIndicator={false}>
     {/* Header */}
     <View style={styles.header}>
          <View style={styles.profileMain}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userInfo?.name?.split(' ').map(n => n[0]).join('') || 'MS'}
              </Text>
            </View>
            <Text style={styles.playerName}>{userInfo.name || 'Mike Smith'}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userInfo.wins + userInfo.losses}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userInfo.wins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{((userInfo.wins / (userInfo.wins + userInfo.losses)) * 100).toFixed(2)}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
          </View>
          {/* Ranking Card */}
          <View style={styles.rankingCard}>
            <Text style={styles.currentRank}>{userInfo.rank}</Text>
            <Text style={styles.rankLabel}>Current League Ranking</Text>
          </View>
          </View>
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            <View style={styles.contactInfo}>
              <ContactItem 
                icon="📧" 
                label="Email" 
                value={userInfo.email}
              />
              <ContactItem 
                icon="📱" 
                label="Phone" 
                value={userInfo.phone || 'Not set'}
              />
              <ContactItem 
                icon="📍" 
                label="Location" 
                value="San Diego, CA"
              />
              <ContactItem 
                icon="🎂" 
                label="Playing Since" 
                value="2019"
              />
            </View>
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
  );
}

const ContactItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <TouchableOpacity style={styles.contactItem}>
    <View style={styles.contactIcon}>
      <Text style={styles.contactIconText}>{icon}</Text>
    </View>
    <View style={styles.contactDetails}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileMain: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#764ba2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  playerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#667eea',
  },
  rankingCard: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  currentRank: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rankLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
  },
  rankChange: {
    alignItems: 'center',
  },
  rankChangeText: {
    color: '#4ade80',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  seeAll: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  contactInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  contactIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#667eea',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactIconText: {
    fontSize: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 2,
  },
  contactAction: {
    padding: 8,
    borderRadius: 6,
  },
  contactActionText: {
    color: '#667eea',
    fontSize: 16,
  },
  matchItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  matchResult: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchWin: {
    backgroundColor: '#d4edda',
  },
  matchLoss: {
    backgroundColor: '#f8d7da',
  },
  matchResultText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  matchWinText: {
    color: '#155724',
  },
  matchLossText: {
    color: '#721c24',
  },
  matchDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  opponentAvatarText: {
    fontWeight: 'bold',
    color: '#666',
  },
  matchInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  matchScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  matchLocation: {
    fontSize: 12,
    color: '#999',
  },
 });
 
