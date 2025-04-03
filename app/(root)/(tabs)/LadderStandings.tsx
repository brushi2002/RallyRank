import React from "react";
import { Text, FlatList, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { verifyInstallation } from "nativewind";
import { Models } from "appwrite";

import { getPlayers, getMatchResults, getLadderMembers } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

type MatchResult = Models.Document & {
  player_id1: string;
  player_id2: string;
  p1set1score: number;
  p1set2score: number;
  p1set3score: number;
  p2set1score: number;
  p2set2score: number;
  p2set3score: number;
  winner: string;
  MatchDate: string;
}

const Item = ({ name, rank, recentMatches, id }: { name: string; rank: number; recentMatches: MatchResult[]; id: string }) => {
  const playerMatches = recentMatches.filter(match => 
    match.player_id1 === id || match.player_id2 === id
  ).slice(0, 3); // Get last 3 matches

  return (
    <View className="p-4 bg-white border-b border-gray-100">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-4">
          <Text className="text-white font-bold">{rank}</Text>
        </View>
        <Text className="text-lg font-semibold text-gray-800">{name}</Text>
      </View>
      {playerMatches.length > 0 && (
        <View className="ml-12">
          <Text className="text-sm text-gray-500 mb-1">Recent Matches:</Text>
          {playerMatches.map((match, index) => (
            <View key={match.$id} className="flex-row items-center mb-1">
              <Text className="text-sm text-gray-600">
                {match.player_id1 === id ? 
                  `${match.p1set1score}-${match.p2set1score}, ${match.p1set2score}-${match.p2set2score}${match.p1set3score ? `, ${match.p1set3score}-${match.p2set3score}` : ''}` :
                  `${match.p2set1score}-${match.p1set1score}, ${match.p2set2score}-${match.p1set2score}${match.p2set3score ? `, ${match.p2set3score}-${match.p1set3score}` : ''}`
                }
              </Text>
              <Text className="text-xs text-gray-400 ml-2">
                vs {match.player_id1 === id ? match.player_id2 : match.player_id1}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const LadderStandings = () => {
  const { 
    data: members,
    loading: playersLoading,
    error: playersError
  } = useAppwrite({
    fn: getLadderMembers,
    skip: false
  });

  const {
    data: matches,
    loading: matchesLoading,
    error: matchesError
  } = useAppwrite({
    fn: getMatchResults,
    skip: false
  });

  console.log('Players:', members?.documents);
  console.log('Matches:', matches?.documents);

  if (playersLoading || matchesLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (playersError || matchesError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-red-500 text-lg">Error loading data</Text>
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
          data={members?.documents || []}
          renderItem={({item, index}) => (
            <Item 
              name={item.player.name} 
              rank={index + 1}
              id={item.$id}
              recentMatches={(matches?.documents || []) as MatchResult[]}
            />
          )}
          keyExtractor={item => item.$id}
          contentContainerClassName="pb-4"
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

