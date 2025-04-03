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
  console.log("matchdata in index.tsx");
  console.log(matchData);

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
          <Text className={`text-xl font-bold ${match.winner === match.player_id1.$id ? 'text-green-600' : match.winner === match.player_id2.$id ? 'text-green-600' : 'text-gray-400'}`}>
            {match.winner === match.player_id1.$id || match.winner === match.player_id2.$id ? 'beat' : 'vs'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600">{match.player_id2.name}</Text>
        </View>
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-sm font-semibold text-gray-700">
          {match.p1set1score}-{match.p2set1score}, {match.p1set2score}-{match.p2set2score}
          {match.p1set3score ? `, ${match.p1set3score}-${match.p2set3score}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="p-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold">Recent Matches</Text>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">New Match</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500">Loading matches...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-red-500">Error loading matches</Text>
            </View>
          ) : matchData?.documents?.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500">No matches found</Text>
            </View>
          ) : (
            matchData?.documents?.map((match: Models.Document) => renderMatchCard(match as MatchResult))
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

