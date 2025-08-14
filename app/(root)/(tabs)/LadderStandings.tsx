import React, { useEffect, useState } from "react";
import { Text, FlatList, ActivityIndicator, View, Alert, StyleSheet } from "react-native";
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
import { Linking } from "react-native";

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

const Item = ({ player, rank }: { player: Player; rank: number }) => {
  const { colors } = useTheme();
  const medalColor = getMedalColor(rank);
  const medalIcon = getMedalIcon(rank);
  const { user } = useGlobalContext();
  const isCurrentUser = player.id === user?.$id;

  return (
    <View style={[styles.itemContainer, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.rankSection}>
        {medalIcon ? (
          <FontAwesome name={medalIcon} size={24} color={medalColor || undefined} />
        ) : (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.playerInfo}>
        <View style={styles.playerHeader}>
          <Text style={[styles.playerName, isCurrentUser && styles.currentUserName]}>
            {player.name}
          </Text>
          <Text style={[styles.playerStats, isCurrentUser && styles.currentUserStats]}>
            {player.wins}W - {player.losses}L
          </Text>
        </View>
        
        <View style={styles.playerDetails}>
          <Text style={[styles.recentMatches, isCurrentUser && styles.currentUserRecent]}>
            Recent: {player.recentMatches.slice(0, 3).map((match) => 
              match.winner === "player1" && match.player_id1.$id === player.id ? 'W' : 'L'
            ).join(' ')}
          </Text>
          <Text style={styles.winRate}>
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">{user?.leagueinfo.league.Name} Standings</Text>
        </View>
        <FlatList
          data={players}
          renderItem={({ item, index }) => <Item player={item} rank={index + 1} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-gray-500 text-lg">No players found</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserContainer: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  currentUserName: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  playerStats: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  currentUserStats: {
    color: '#667eea',
  },
  playerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentMatches: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  currentUserRecent: {
    color: '#667eea',
  },
  winRate: {
    fontSize: 12,
    color: '#999',
  },
  challengeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  challengeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LadderStandings;

