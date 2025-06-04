import React, { useEffect, useState } from "react";
import { Text, FlatList, ActivityIndicator, View, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { verifyInstallation } from "nativewind";
import { Models } from "appwrite";
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getAllMatchResults, databases, getMatchResultsForLeague } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getPlayers, getLadderMembers } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
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
    <View className={`flex-row items-center p-4 mb-2 rounded-lg shadow-sm ${isCurrentUser ? 'bg-green-50' : 'bg-white'}`}>
      <View className="flex-1">
        <View className="flex-row items-center">
          {medalIcon ? (
            <FontAwesome name={medalIcon} size={20} color={medalColor || undefined} style={{ marginRight: 8 }} />
          ) : (
            <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center mr-2">
              <Text className="text-gray-600">{rank}</Text>
            </View>
          )}
          <Text className={`text-lg ${isCurrentUser ? 'font-bold text-blue-700' : 'font-semibold'} flex-1`}>{player.name}</Text>
          <Text className={`${isCurrentUser ? 'text-blue-600' : 'text-gray-600'}`}>
            {player.wins}W - {player.losses}L
          </Text>
          {!isCurrentUser && user && (
            <TouchableOpacity 
              onPress={() => handleChallenge(user.name, player.PhoneNumber, user.leagueinfo.league.Name)}
              className="ml-4 bg-blue-500 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-sm">Challenge</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-2">
          <Text className={`text-sm ${isCurrentUser ? 'text-blue-500' : 'text-gray-500'}`}>
            Recent matches: {player.recentMatches.slice(0, 3).map((match) => 
              match.winner === "player1" && match.player_id1.$id === player.id ? 'W' : 'L'
            ).join(' ')}
          </Text>
        </View>
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Ladder Standings</Text>
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

export default LadderStandings;

