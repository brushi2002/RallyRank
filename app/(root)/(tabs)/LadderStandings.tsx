import React, { useEffect, useState } from "react";
import { Text, FlatList, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { verifyInstallation } from "nativewind";
import { Models } from "appwrite";
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getAllMatchResults, databases } from "@/lib/appwrite";

import { getPlayers, getLadderMembers } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

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
  wins: number;
  losses: number;
  recentMatches: MatchResult[];
  winPercentage: number;
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

const Item = ({ player, rank }: { player: Player; rank: number }) => {
  const { colors } = useTheme();
  const medalColor = getMedalColor(rank);
  const medalIcon = getMedalIcon(rank);

  return (
    <View className="flex-row items-center bg-white p-4 mb-2 rounded-lg shadow-sm">
      <View className="flex-1">
        <View className="flex-row items-center">
          {medalIcon ? (
            <FontAwesome name={medalIcon} size={20} color={medalColor || undefined} style={{ marginRight: 8 }} />
          ) : (
            <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center mr-2">
              <Text className="text-gray-600">{rank}</Text>
            </View>
          )}
          <Text className="text-lg font-semibold flex-1">{player.name}</Text>
          <Text className="text-gray-600">
            {player.wins}W - {player.losses}L
          </Text>
        </View>
        <View className="mt-2">
          <Text className="text-gray-500 text-sm">
            Recent matches: {player.recentMatches.slice(0, 3).map((match) => 
              match.winner === player.id ? 'W' : 'L'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersResponse, matchesResponse] = await Promise.all([
          databases.listDocuments(process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!, process.env.EXPO_PUBLIC_APPWRITE_PLAYER_COLLECTION_ID!, []),
          getAllMatchResults()
        ]);

        if (!playersResponse?.documents || !matchesResponse?.documents) {
          throw new Error('Failed to fetch data');
        }

        const matches = matchesResponse.documents as MatchResult[];
        const playerStats = new Map<string, Player>();

        // Initialize player stats
        playersResponse.documents.forEach((player: Models.Document) => {
          playerStats.set(player.$id, {
            id: player.$id,
            name: player.name,
            wins: 0,
            losses: 0,
            recentMatches: [],
            winPercentage: 0
          });
        });

        // Process matches
        matches.forEach((match) => {
          const winner = playerStats.get(match.winner);
          const loser = playerStats.get(match.loser);

          if (winner) {
            winner.wins++;
            winner.recentMatches.push(match);
          }
          if (loser) {
            loser.losses++;
            loser.recentMatches.push(match);
          }
        });

        // Calculate win percentages and sort
        const rankedPlayers = Array.from(playerStats.values())
          .map(player => ({
            ...player,
            winPercentage: player.wins / (player.wins + player.losses) || 0
          }))
          .sort((a, b) => b.winPercentage - a.winPercentage);

        setPlayers(rankedPlayers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load ladder standings');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

