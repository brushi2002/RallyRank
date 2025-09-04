import React, { useEffect, useState } from "react";
import { Text, FlatList, ActivityIndicator, View, Alert, StyleSheet, ImageBackground, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Models } from "appwrite";
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getAllMatchResults, databases, getMatchResultsForLeague } from "../../../lib/appwrite";
import { useGlobalContext } from "../../../lib/global-provider";
import { getPlayers, getLadderMembers } from "../../../lib/appwrite";
import { useAppwrite } from "../../../lib/useAppwrite";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Linking, Pressable  } from "react-native";
import PlayerCardModal from "../../../components/PlayerCardModal";


type MatchResult = Models.Document & {
  winner: string;
  loser: string;
  winnerScore: number;
  loserScore: number;
  date: string;
};

type Player = {
  id: string;
  name: string;
  PhoneNumber: string;
  wins: number;
  losses: number;
  recentMatches: MatchResult[];
  winPercentage: number;
  rating: number;
};

const getMedalColor = (rank: number): string | null => {
  switch (rank) {
    case 1:
      return '#FFD700'; // Gold
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return null;
  }
};

const getMedalIcon = (rank: number): "trophy" | null => {
  switch (rank) {
    case 1:
    case 2:
    case 3:
      return "trophy";
    default:
      return null;
  }
};

const handleChallenge = (name: string, phoneNumber: string, ladderName: string) => {
  if (!phoneNumber) {
    Alert.alert("Error", "No phone number available for this player");
    return;
  }

  console.log("Challenge button pressed name:", name, phoneNumber);
  
  const message = `Hi This is ${name} from the ${ladderName}, I am interested in scheduling a challenge match with you. When are you available?`;
  Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
}

const UserAvatar = () => (
  <View style={styles.avatar}>
    <View style={styles.userSilhouette}>
      <View style={styles.userHead} />
      <View style={styles.userBody} />
    </View>
  </View>
);

const Item = ({ player, rank }: { player: Player; rank: number }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { colors } = useTheme();
  const medalColor = getMedalColor(rank);
  const medalIcon = getMedalIcon(rank);
  const { user } = useGlobalContext();
  const isCurrentUser = player.id === user?.$id;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.rankSection}>
            {medalIcon ? (
              <FontAwesome name={medalIcon} size={32} color={medalColor || undefined} />
            ) : (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{rank}</Text>
              </View>
            )}
          </View>
          
          <UserAvatar />
          
          <View style={styles.playerInfo}>
            <Text style={styles.playerName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {player.name}
            </Text>
            <Text style={styles.playerRecord} numberOfLines={1}>
              Recent: {player.recentMatches.slice(0, 3).map((match) => 
                match.winner === "player1" && match.player_id1.$id === player.id ? 'W' : 'L'
              ).join(' ')}
            </Text>
            <Text style={styles.winRate} numberOfLines={1}>
              Win Rate: {((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        
        {!isCurrentUser && user && (
          <TouchableOpacity 
            style={styles.challengeButton}
            onPress={() => handleChallenge(user.name, player.PhoneNumber, user.leagueinfo.league.Name)}
          >
            <Text style={styles.challengeButtonText}>Challenge</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const LadderStandings = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useGlobalContext();

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          console.log("Fetching ladder data...");
          console.log(user?.leagueinfo.league.$id)
          const [playersResponse, matchesResponse] = await Promise.all([
            getLadderMembers(user?.leagueinfo.league.$id as string),
            getMatchResultsForLeague(user?.leagueinfo.league.$id || '')
          ]);

          //console.log("Players response structure:", JSON.stringify(playersResponse, null, 2));
          //console.log("Matches response structure:", JSON.stringify(matchesResponse, null, 2));

          if (!playersResponse?.documents || !matchesResponse?.documents) {
            throw new Error('Failed to fetch data');
          }

          const matches = matchesResponse.documents as MatchResult[];
          const playerStats = new Map<string, Player>();
          
          // Initialize player stats
          playersResponse.documents.forEach((player: Models.Document) => {
            console.log("Player document structure:", JSON.stringify(player, null, 2));
            playerStats.set(player.player.$id, {
              id: player.player.$id,
              name: player.player.name,
              PhoneNumber: player.player.PhoneNumber,
              wins: 0,
              losses: 0,
              recentMatches: [],
              winPercentage: 0,
              rating: player.rating_value
            });
          });

          console.log("Player stats after initialization:", Array.from(playerStats.entries()));

          // Process matches
          matches.forEach((match) => {
            console.log("Processing match:", JSON.stringify(match, null, 2));
            let winner, loser;
            
            if(match.winner == "player1") {
              winner = playerStats.get(match.player_id1.$id);
              loser = playerStats.get(match.player_id2.$id);
            }
            else
            {
              winner = playerStats.get(match.player_id2.$id);
              loser = playerStats.get(match.player_id1.$id);
            }

            if (winner) {
              winner.wins++;
              winner.recentMatches.push(match);
            }
            if (loser) {
              loser.losses++;
              loser.recentMatches.push(match);
            }
          });

          console.log("Player stats after processing matches:", Array.from(playerStats.entries()));

          // Calculate win percentages and sort
          const rankedPlayers = Array.from(playerStats.values())
            .sort((a, b) => b.rating - a.rating);
          
          console.log("Final ranked players:", rankedPlayers);

          setPlayers(rankedPlayers);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load ladder standings');
          setLoading(false);
        }
      };

      fetchData();
    }, [user?.leagueinfo.$id])
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-red-500 text-lg">{error}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/LadderStandingsBGImage.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Header with minimal overlay */}
          <View style={styles.header}>
            <View style={styles.headerOverlay} />
            <Text style={styles.headerTitle}>League Standings</Text>
          </View>
          
          {/* Players List with background overlay */}
          <View style={styles.listSection}>
            <View style={styles.listOverlay} />
            <FlatList
              data={players}
              renderItem={({ item, index }) => <Item player={item} rank={index + 1} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No players found</Text>
                </View>
              )}
            />
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 2,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 140,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  listSection: {
    flex: 1,
    position: 'relative',
  },
  listOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(71, 168, 106, 0.85)',
  },
  listContainer: {
    padding: 16,
    paddingTop: 50,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  rankSection: {
    width: 35,
    alignItems: 'center',
    marginRight: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#47A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#47A86A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
    backgroundColor: 'white',
    marginBottom: 2,
  },
  userBody: {
    width: 18,
    height: 12,
    backgroundColor: 'white',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    flexShrink: 1,
  },
  playerRecord: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  winRate: {
    fontSize: 12,
    color: '#666',
  },
  challengeButton: {
    backgroundColor: '#47A86A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  challengeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LadderStandings;

