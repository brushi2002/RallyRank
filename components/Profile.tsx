import { useGlobalContext } from '../lib/global-provider';
import { useState } from 'react';
import { account } from '../lib/appwrite';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Button, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar, TextInput } from 'react-native';
import { Image } from 'react-native';
type ExtendedUser = {
  name?: string;
  email: string;
  city: string;
  county: string;
  state: string;
  country: string;
  deviceType: string;
  location?: string;
  phone?: string;
  wins: number;
  losses: number;
  leagueinfo?: any;
  rank: number;
}

type ProfileProps = {
  edit: boolean;
}

const Profile = (props: ProfileProps) => {
  console.log("Profile component rendering...");

  const { user, loading, refetch } = useGlobalContext();

  console.log("User data:", user);
  console.log("Loading:", loading);

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
    console.log("Profile: Loading state");
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'}}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={{marginTop: 10}}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    console.log("Profile: No user found");
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'}}>
        <Text style={{fontSize: 18, color: '#666'}}>Please sign in to view your profile</Text>
      </SafeAreaView>
    );
  }

  try {
    const userInfo: ExtendedUser = {
      name: user.name || 'Unknown User',
      email: user.email || 'No email',
      city: user.City || '',
      county: user.County || '',
      state: user.State || '',
      country: user.Country || '',
      deviceType: user.DeviceType || '',
      location: (user as any).prefs?.location as string | undefined,
      phone: user.PhoneNumber || 'Not provided',
      wins: user.leagueinfo?.wins || 0,
      losses: user.leagueinfo?.losses || 0,
      rank: user.leagueinfo?.rank || 0
    };

    console.log("Profile: User info processed:", userInfo);

    const totalMatches = userInfo.wins + userInfo.losses;
    const winRate = totalMatches > 0 ? (userInfo.wins / totalMatches * 100).toFixed(1) : 0.0;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#316536" />
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Green Gradient Header */}
          <View style={styles.header}>
          <View style={styles.profileCircle}>
            <View style={styles.profileIcon}>
                {/* Background image */}
                <Image 
                  source={require('../assets/images/user-background-creme.png')} 
                  style={styles.profileBackgroundImage}
                  resizeMode="contain"
                />
                {/* Foreground user head */}
                <Image 
                  source={require('../assets/images/user-head-green.png')} 
                  style={styles.profileImage}
                  resizeMode="contain"
                />
            </View>
          </View>
          
          <Text style={styles.headerTitle}>{userInfo.name}</Text>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalMatches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userInfo.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Current League Ranking */}
        <View style={styles.rankingSection}>
          <Text style={styles.rankingNumber}>{userInfo.rank}</Text>
          <Text style={styles.rankingLabel}>Current League Ranking</Text>
        </View>

        {/* General Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>GENERAL INFORMATION</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NAME</Text>
            <TextInput
              style={styles.textInput}
              value={userInfo.name}
              editable={props.edit}
              placeholder="Enter name"
            />
            <View style={styles.inputUnderline} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.textInput}
              value={userInfo.email}
              editable={props.edit}
              placeholder="Enter email"
            />
            <View style={styles.inputUnderline} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LOCATION</Text>
            <TextInput
              style={styles.textInput}
              value={`${userInfo.city}, ${userInfo.state}`}
              editable={props.edit}
              placeholder="Enter location"
            />
            <View style={styles.inputUnderline} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MEMBER SINCE</Text>
            <TextInput
              style={styles.textInput}
              value="2024" // You can calculate this from user creation date
              editable={false}
              placeholder="Member since"
            />
            <View style={styles.inputUnderline} />
          </View>

          {!props.edit && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.disableButton} onPress={handleDisableAccount}>
                <Text style={styles.disableButtonText}>Disable Account</Text>
              </TouchableOpacity>
              
              <View style={styles.linkContainer}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.rally-rank.com/terms-of-use')}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>Terms of Use</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.rally-rank.com/privacy-policy')}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (error: any) {
    console.error("Profile component error:", error);
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'}}>
        <Text style={{fontSize: 18, color: '#666', textAlign: 'center', padding: 20}}>
          Error loading profile. Please try again.
        </Text>
        <Text style={{fontSize: 14, color: '#999', textAlign: 'center'}}>
          {error.toString()}
        </Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#316536',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFEEBC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  profileBackgroundImage: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    zIndex: 2,
  },
  userSilhouette: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 6,
  },
  userHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#316536',
    marginBottom: 3,
  },
  userBody: {
    width: 22,
    height: 16,
    backgroundColor: '#316536',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'Rubik',
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Rubik',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Rubik',
    marginTop: 5,
  },
  rankingSection: {
    backgroundColor: '#47A86A',
    paddingVertical: 30,
    alignItems: 'center',
  },
  rankingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Rubik',
  },
  rankingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Rubik',
    marginTop: 5,
  },
  infoSection: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'Rubik',
    marginBottom: 30,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'Rubik',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Rubik',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 5,
  },
  actionButtons: {
    marginTop: 40,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  disableButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  disableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  linkButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'Rubik',
    textDecorationLine: 'underline',
  },
});

export default Profile;