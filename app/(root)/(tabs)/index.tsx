import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppwrite } from '@/lib/useAppwrite';
<<<<<<< HEAD
import { getMatchResults } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
=======
import { getAllMatchResults, getMatchResultsForLeague } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
import { useState, useEffect } from 'react';
import { useGlobalContext, GlobalProvider } from '@/lib/global-provider';
>>>>>>> ae26a61 (fixing)

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

<<<<<<< HEAD
const handleCategoryPress = (category: string) => {
  console.log(category);
}

export default function HomeScreen() {
  const { data: matchData, loading, error } = useAppwrite({
    fn: getMatchResults,
    skip: false
  });
  console.log("matchdata in index.tsx");
  console.log(matchData);
=======
export default function HomeScreen() {
  return (
    <GlobalProvider>
      <HomeScreenContent />
    </GlobalProvider>
  );
}

function HomeScreenContent() {
  const { data: matchData, loading, error } = useAppwrite({
    fn: () => getMatchResultsForLeague(),
    skip: false
  });

  //console.log("matchdata in index.tsx");
  //console.log(matchData?.documents);

  const [MData, setMData] = useState<MatchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  useEffect(() => {
    if (matchData?.documents) {
      setMData(matchData.documents as MatchResult[]);
    }
  }, [matchData]);

  const { user } = useGlobalContext();

  const handleCategoryPress = (category: string) => {
    //console.log(category);
    setSelectedCategory(category);
    if (!user) return;
    const UserID = user.$id;
    
    if(category == "My Matches") {
      setMData(matchData?.documents?.filter((match: any) => 
        match.player_id1.$id == UserID || match.player_id2.$id == UserID
      ) as MatchResult[]);
    } else {
      // Reset to all matches when no category is selected
      setMData(matchData?.documents as MatchResult[]);
    }
  }

  //console.log("matchdata in index.tsx");
  //console.log(matchData);
>>>>>>> ae26a61 (fixing)

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
          {match.p1set3score !== undefined || (match.p1set3score !== 0 && match.p2set3score !== 0) && (
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
    <SafeAreaProvider>
<<<<<<< HEAD
      <View style={{flex: 1, padding: 5, backgroundColor: 'blue'}}>
        {Categories.map((category) => (
          <TouchableOpacity 
          key={category}

          className="flex flex-col items-start mr-4 px-4 py-2 rounded-full bg-gray-100"
          onPress={() => handleCategoryPress(category)}
          >
          <Text className={`text-sm`}>
            {category}
          </Text>
        </TouchableOpacity>



        ))}
      
      </View>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Text className="text-2xl font-bold mb-4">Recent Matches</Text>
=======
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="py-2 bg-white border-b border-gray-200">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-row px-4"
          >
            {Categories.map((category) => (
              <TouchableOpacity 
                key={category}
                className={`items-start mr-4 px-4 py-1.5 rounded-full ${
                  selectedCategory === category ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                onPress={() => selectedCategory === category ? handleCategoryPress("") : handleCategoryPress(category)}
              >
                <Text className={`text-sm ${
                  selectedCategory === category ? 'text-white' : 'text-gray-800'
                }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 8 }}>
          <Text className="text-2xl font-bold mb-2">Recent Matches</Text>
>>>>>>> ae26a61 (fixing)
          {loading ? (
            <Text>Loading...</Text>
          ) : error ? (
            <Text>Error: {error.toString()}</Text>
<<<<<<< HEAD
          ) : matchData?.documents && matchData.documents.length > 0 ? (
            matchData.documents.map((match) => renderMatchCard(match as MatchResult))
=======
          ) : MData && MData.length > 0 ? (
            MData.map((match: MatchResult) => renderMatchCard(match))
>>>>>>> ae26a61 (fixing)
          ) : (
            <Text>No matches found</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

