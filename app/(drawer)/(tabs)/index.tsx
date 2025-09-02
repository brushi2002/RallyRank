import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppwrite } from '../../../lib/useAppwrite';
import { getAllMatchResults, getMatchResultsForLeague } from '../../../lib/appwrite';
import { Models } from 'react-native-appwrite';
import { useState, useEffect } from 'react';
import { useGlobalContext, GlobalProvider } from '../../../lib/global-provider';
import { useFocusEffect } from '@react-navigation/native';

interface MatchResult extends Models.Document {
  player_id1: any;
  player_id2: any;
  winner: string;
  MatchDate: string;
  p1set1score: number;
  p1set2score: number;
  p1set3score: number;
  p2set1score: number;
  p2set2score: number;
  p2set3score: number;
}

const Categories = ["My Matches"];

export default function HomeScreen() {
  return (
    <GlobalProvider>
      <HomeScreenContent />
    </GlobalProvider>
  );
}

function HomeScreenContent() {
  const [MData, setMData] = useState<MatchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { user } = useGlobalContext();
  const { data: matchData, loading, error } = useAppwrite({
    fn: () => getMatchResultsForLeague(user?.leagueinfo.league.$id || ''),
    skip: false
  });

  useFocusEffect(
    React.useCallback(() => {
      if (!user?.leagueinfo.$id) return;
      
      const fetchData = async () => {
        getMatchResultsForLeague(user?.leagueinfo.league.$id || '').then((matchData) => {
          if (matchData?.documents) {
            setMData(matchData.documents as MatchResult[]);
          }

        });
      };
      fetchData();

      return () => {
        setSelectedCategory('');
      }
    }, [user?.leagueinfo.$id])
  );

   console.log('Match data in HomeScreenContent:', MData);

  const handleCategoryPress = (category: string) => {
    console.log(category);
    
    if (!user) return;
    const UserID = user.$id;
    console.log('UserID', UserID);
    console.log('matchData', matchData);
    if(category == "My Matches") {
      setSelectedCategory(category);
      setMData(matchData?.documents?.filter((match: any) => 
        match.player_id1.$id == UserID || match.player_id2.$id == UserID
      ) as MatchResult[]);
    } else {
      setSelectedCategory('');
      // Reset to all matches when no category is selected
      console.log('no category selected');
      setMData(matchData?.documents as MatchResult[]);
    }
    console.log('MData', MData);
  }

  //console.log("matchdata in index.tsx");
  //console.log(matchData);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const UserAvatar = ({ isWinner }: { isWinner: boolean }) => (
    <View style={[styles.avatar, isWinner ? styles.winnerAvatar : styles.normalAvatar]}>
      <View style={styles.userSilhouette}>
        <View style={styles.userHead} />
        <View style={styles.userBody} />
      </View>
    </View>
  );

  const renderMatchCard = (match: MatchResult, index: number) => {
    const isPlayer1Winner = match.winner === 'player1';
    const winnerName = isPlayer1Winner ? match.player_id1.name : match.player_id2.name;
    const isEvenCard = index % 2 === 0;

    return (
      <TouchableOpacity 
        key={match.$id}
        style={[styles.matchCard, isEvenCard ? styles.evenCard : styles.oddCard]}
      >
        {/* Date */}
        <Text style={styles.matchDate}>{formatDate(match.MatchDate)}</Text>
        
        {/* Players Row */}
        <View style={styles.playersRow}>
          {/* Player 1 */}
          <View style={styles.playerSection}>
            <UserAvatar isWinner={isPlayer1Winner} />
            <Text style={styles.playerName}>{match.player_id1.name}</Text>
            <View style={styles.scoresColumn}>
              <Text style={styles.scoreText}>{match.p1set1score}-{match.p2set1score}</Text>
              {(match.p1set2score !== undefined && match.p1set2score !== 0) && (
                <Text style={styles.scoreText}>{match.p1set2score}-{match.p2set2score}</Text>
              )}
              {(match.p1set3score !== undefined && match.p1set3score !== 0) && (
                <Text style={styles.scoreText}>{match.p1set3score}-{match.p2set3score}</Text>
              )}
            </View>
          </View>
          
          {/* VS Section */}
          <View style={styles.vsSection}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          {/* Player 2 */}
          <View style={styles.playerSection}>
            <UserAvatar isWinner={!isPlayer1Winner} />
            <Text style={styles.playerName}>{match.player_id2.name}</Text>
            <View style={styles.scoresColumn}>
              <Text style={styles.scoreText}>{match.p2set1score}-{match.p1set1score}</Text>
              {(match.p2set2score !== undefined && match.p2set2score !== 0) && (
                <Text style={styles.scoreText}>{match.p2set2score}-{match.p1set2score}</Text>
              )}
              {(match.p2set3score !== undefined && match.p2set3score !== 0) && (
                <Text style={styles.scoreText}>{match.p2set3score}-{match.p1set3score}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Winner */}
        <Text style={styles.winnerText}>Winner: <Text style={styles.winnerName}>{winnerName}</Text></Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
        
        {/* Green and Yellow Gradient Background */}
        <View style={styles.gradientBackground}>
          <View style={styles.gradientLayer1} />
          <View style={styles.gradientLayer2} />
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.myMatchesButton, selectedCategory === 'My Matches' && styles.activeButton]}
            onPress={() => selectedCategory === 'My Matches' ? handleCategoryPress("") : handleCategoryPress('My Matches')}
          >
            <Text style={[styles.myMatchesText, selectedCategory === 'My Matches' && styles.activeButtonText]}>
              My Matches
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Matches Title */}
        <View style={styles.titleSection}>
          <Text style={styles.recentMatchesTitle}>Recent Matches</Text>
        </View>

        {/* Matches List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.errorText}>Error: {error.toString()}</Text>
          ) : MData && MData.length > 0 ? (
            MData.map((match: MatchResult, index: number) => renderMatchCard(match, index))
          ) : (
            <Text style={styles.noMatchesText}>No matches found</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradientBackground: {
    position: 'absolute',
    top: -200,
    left: -100,
    width: 500,
    height: 400,
    transform: [{ rotate: '-19deg' }],
    overflow: 'hidden',
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#47A86A',
    opacity: 0.3,
    borderRadius: 200,
  },
  gradientLayer2: {
    position: 'absolute',
    top: 80,
    left: 80,
    width: '80%',
    height: '80%',
    backgroundColor: '#EFEEBC',
    opacity: 0.2,
    borderRadius: 150,
  },
  header: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  myMatchesButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#316536',
  },
  myMatchesText: {
    color: '#47A86A',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Rubik',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
  },
  recentMatchesTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#316536',
    fontFamily: 'Rubik',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evenCard: {
    backgroundColor: '#FFFFFF',
  },
  oddCard: {
    backgroundColor: '#F0F0F0',
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#316536',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Rubik',
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  playerSection: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  normalAvatar: {
    backgroundColor: '#316536',
  },
  winnerAvatar: {
    backgroundColor: '#47A86A',
  },
  userSilhouette: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 4,
  },
  userHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  userBody: {
    width: 18,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#316536',
    marginBottom: 8,
    fontFamily: 'Rubik',
  },
  scoresColumn: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Rubik',
    marginBottom: 2,
  },
  vsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CCCCCC',
    fontFamily: 'Rubik',
  },
  winnerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Rubik',
  },
  winnerName: {
    color: '#47A86A',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FF0000',
    marginTop: 50,
  },
  noMatchesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 50,
  },
});

