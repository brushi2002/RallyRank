import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppwrite } from '@/lib/useAppwrite';
import { getMatchResults } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

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

export default function HomeScreen() {
  const { data: matchData, loading, error } = useAppwrite({
    fn: getMatchResults,
    skip: false
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMatchCard = (match: MatchResult) => (
    <TouchableOpacity 
      key={match.$id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-500">{formatDate(match.MatchDate)}</Text>
      </View>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="text-sm text-gray-600">{match.player_id1.name}</Text>
        </View>
        <View className="px-4">
          <Text className="text-sm font-semibold">vs</Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-sm text-gray-600">{match.player_id2.name}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold">{match.p1set1score}-{match.p2set1score}</Text>
          {match.p1set2score !== undefined && (
            <Text className="text-lg font-semibold">{match.p1set2score}-{match.p2set2score}</Text>
          )}
          {match.p1set3score != 0 && match.p2set3score != 0 && (
            <Text className="text-lg font-semibold">{match.p1set3score}-{match.p2set3score}</Text>
          )}
        </View>
        <View className="flex-1 items-end">
          <Text className="text-sm font-semibold text-green-600">
            Winner: {match.winner === match.player_id1.$id ? match.player_id1.name : match.player_id2.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={true}
      >
        <Text className="text-2xl font-bold mb-4">Recent Matches</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error: {error.toString()}</Text>
        ) : matchData?.documents && matchData.documents.length > 0 ? (
          matchData.documents.map((match) => renderMatchCard(match as MatchResult))
        ) : (
          <Text>No matches found</Text>
        )}
      </ScrollView>
    </View>
  );
}

