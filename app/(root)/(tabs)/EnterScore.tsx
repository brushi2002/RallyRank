import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, StyleSheet, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { getPlayers, createMatchResult, config } from '../../../lib/appwrite';
import { useAppwrite } from '../../../lib/useAppwrite';
import { GlobalProvider, useGlobalContext } from '../../../lib/global-provider';
import { useFocusEffect } from '@react-navigation/native';

interface SetScore {
  player1: number;
  player2: number;
  tiebreaker: number | null;
}

const SetScoreInput = ({ 
  setNumber, 
  scores, 
  onScoreChange,
  onTieBreakerChange,
  hasWinner, 
  ErrMessage,
  showTiebreaker
}: { 
  setNumber: number, 
  scores: SetScore, 
  onScoreChange: (player: 'player1' | 'player2', score: number) => void,
  onTieBreakerChange: (score: number) => void,
  hasWinner: boolean,
  ErrMessage: string,
  showTiebreaker: boolean
}) => {
  return (
    <View className="mb-2" style={{opacity: (hasWinner && setNumber == 3) ? 0 : 1}}>
      <Text className="text-lg mb-1">Set {setNumber}:</Text>
      <View className="flex-row justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-sm mb-2">Your Score:</Text>
          <View className="flex-row flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((value) => (
              <TouchableOpacity
                key={value}
                style={{opacity: (hasWinner && setNumber == 3) ? 0 : 1}}
                onPress={() => onScoreChange('player1', value)}
                className={`px-4 py-2 rounded ${
                  scores.player1 === value ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <Text className={scores.player1 === value ? 'text-white' : 'text-gray-800'}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Tiebreaker scores in a separate row */}

          {showTiebreaker && (
            <View className="flex-row justify-between mt-4">
              
              <View className="flex-1">
              <Text className="text-sm mb-2">Tiebreaker Points of Loser:</Text>
                <TextInput
                  style={[styles.input, {width: 70}]}
                  onChangeText={(text) => onTieBreakerChange(parseInt(text))}
                  placeholder="TieBreak Points"
                  autoCapitalize="none"
                  maxLength={2}
                />
              </View>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm mb-2">Opponent Score:</Text>
          <View className="flex-row flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((value) => (
              <TouchableOpacity
                key={value}
                style={{opacity: (hasWinner && setNumber == 3) ? 0 : 1}}
                onPress={() => onScoreChange('player2', value)}
                className={`px-4 py-2 rounded ${
                  scores.player2 === value ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <Text className={scores.player2 === value ? 'text-white' : 'text-gray-800'}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Error message in its own row */}
      {ErrMessage ? (
        <Text className="text-red-500 mt-2">
          {ErrMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  buttonContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});

export default function EnterScore() {
  const { user } = useGlobalContext();
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [HasWininTwo, setHasWininTwo] = useState(false);
  const [message, setMessage] = useState([] as string[]);
  const [setScores, setSetScores] = useState<SetScore[]>([
    { player1: 0, player2: 0, tiebreaker: null },
    { player1: 0, player2: 0, tiebreaker: null },
    { player1: 0, player2: 0, tiebreaker: null }
  ]);
  const [winner, setWinner] = useState('');
  const [set1tiebreaker, setSet1tiebreaker] = useState(false);
  const [set2tiebreaker, setSet2tiebreaker] = useState(false);
  const [set3tiebreaker, setSet3tiebreaker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedOpponentName, setSelectedOpponentName] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      
      return () => {
        console.log("unmounting");
        setSelectedOpponent('');
        setSelectedOpponentName('');
        setSetScores([
          { player1: 0, player2: 0, tiebreaker: 0 },
          { player1: 0, player2: 0, tiebreaker: 0 },
          { player1: 0, player2: 0, tiebreaker: 0 }
        ]);
        setMessage(["", "", ""]);
        setHasWininTwo(false);
        setWinner('');
        setSet1tiebreaker(false);
        setSet2tiebreaker(false);
        setSet3tiebreaker(false);
      }
    }, [])
  );

  const { data: playersData, loading, error } = useAppwrite({
    fn: () => getPlayers(user?.leagueinfo.league.$id || ''),
    skip: false
  });



  const handleTieBreakerChange = (setIndex: number, score: number) => {
    console.log('yep HTS');

    console.log(score);
    const newScores = [...setScores];
    newScores[setIndex] = {
      ...newScores[setIndex],
      tiebreaker: score
    };
    setSetScores(newScores);
  };

  const handleScoreChange = (setIndex: number, player: 'player1' | 'player2', score: number) => {
    const newScores = [...setScores];
    let winner = '';
    newScores[setIndex] = {
      ...newScores[setIndex],
      [player]: score
    };
    console.log(newScores);
    setSetScores(newScores);

     //check if the same player won the first 2 sets
    if(((newScores[0].player1 == 6 && newScores[0].player2 != 7) || newScores[0].player1 == 7) && ((newScores[1].player1 == 6 && newScores[1].player2 != 7) || newScores[1].player1 == 7))
    {
        setHasWininTwo(true);
        setWinner('player1');
        setSet3tiebreaker(false);
        newScores[2].player1 = 0;
        newScores[2].player2 = 0;
    }
    else if(((newScores[0].player2 == 6 && newScores[0].player1 != 7) || newScores[0].player2 == 7) && ((newScores[1].player2 == 6 && newScores[1].player1 != 7) || newScores[1].player2 == 7))
    {
        setHasWininTwo(true);
        setWinner('player2');
        setSet3tiebreaker(false);
        newScores[2].player1 = 0;
        newScores[2].player2 = 0;
    }
    else
    {
      setHasWininTwo(false);
      if((newScores[2].player1 == 6 && newScores[2].player2 != 7) || (newScores[2].player1 == 7))
      {
        setWinner('player1');
      }
      else if((newScores[2].player2 == 6 && newScores[2].player1 != 7) || (newScores[2].player2 == 7))
      {
        setWinner('player2');
      }
    }
    //const validSetScore = /^(6-[0-5]|7-[5-6]|7-6\([1-7]-[1-7]\))$/;
    const regex = /^(6-[0-4]|7-[5-6]|7-6|[0-4]-6|[5-6]-7|6-7)$/;
    let set1Score = newScores[0].player1 + "-" + newScores[0].player2
    let set2Score = newScores[1].player1 + "-" + newScores[1].player2
    let set3Score = newScores[2].player1 + "-" + newScores[2].player2


     ///figure out some validation messages
    //if((newScores[0].player1 != 6 && newScores[0].player1 != 7 && newScores[0].player2 != 6 && newScores[0].player2 != 7) || (newScores[0].player1 == 7 && newScores[0].player2 == 7) || (newScores[0].player1 == 6 && newScores[0].player2 == 6))
    if(!regex.test(set1Score))
    {
         setMessage(["Set 1 doesn't have a winner", "", ""])
    }
    else if(!regex.test(set2Score))
    {
      setMessage(["", "Set 2 doesn't have a winner", ""])
    }
    else if(!HasWininTwo && !regex.test(set3Score))
    {
      setMessage(["", "", "Set 3 doesn't have a winner"])
    }
    else
    {
      setMessage(["", "", ""])
    }
    //tbd maybe move into  own function
    const regextiebreaker = /^(7-6|6-7)$/;
    console.log(set1Score); //console.log(newScores);   
    if(regextiebreaker.test(set3Score) && !HasWininTwo)
    {
      setSet3tiebreaker(true);
    }
    else
    {
      setSet3tiebreaker(false);
    }
    if(regextiebreaker.test(set2Score))
    {
      setSet2tiebreaker(true);
    }
    else
    {
      setSet2tiebreaker(false);
    }
    if(regextiebreaker.test(set1Score))
    {
      console.log("yep");
      setSet1tiebreaker(true);
    }
    else
    {
      setSet1tiebreaker(false);
    }
      //console.log(hasWinner);
  };

  const handleSubmit = async () => {
    if (!selectedOpponent) {
      alert('Please select an opponent');
      return;
    }
    
    // Validate set scores
    const validSetScore = /^(6-[0-5]|7-[5-6]|7-6|[0-4]-6|[5-6]-7|6-7)$/;
    const set1Score = `${setScores[0].player1}-${setScores[0].player2}`;
    const set2Score = `${setScores[1].player1}-${setScores[1].player2}`;
    const set3Score = `${setScores[2].player1}-${setScores[2].player2}`;

    if (!validSetScore.test(set1Score)) {
      alert('Please enter a valid score for Set 1');
      return;
    }
    if (!validSetScore.test(set2Score)) {
      alert('Please enter a valid score for Set 2');
      return;
    }
    if (!HasWininTwo && !validSetScore.test(set3Score)) {
      alert('Please enter a valid score for Set 3');
      return;
    }

    console.log(setScores[0].tiebreaker);
    console.log(setScores);
    if(((setScores[0].tiebreaker == null || setScores[0].tiebreaker == 0) && set1tiebreaker == true) || ((setScores[1].tiebreaker == null || setScores[1].tiebreaker == 0) && set2tiebreaker == true) || ((setScores[2].tiebreaker == null || setScores[2].tiebreaker == 0) && set3tiebreaker == true && !HasWininTwo))
    {
      alert('Please enter a tiebreaker score');
      return;
    }
    
      console.log(user);
    if (!user?.$id) {
      alert('User not found. Please try logging in again.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createMatchResult({
        league: user.leagueinfo.league.$id || '',
        player_id1: user.$id,
        player_id2: selectedOpponent,
        p1set1score: setScores[0].player1,
        p1set2score: setScores[1].player1,
        p1set3score: setScores[2].player1,
        p2set1score: setScores[0].player2,
        p2set2score: setScores[1].player2,
        p2set3score: setScores[2].player2,
        winner: winner,
        MatchDate: new Date().toISOString(),
        s1TieBreakerPointsLost: setScores[0].tiebreaker,
        s2TieBreakerPointsLost: setScores[1].tiebreaker,
        s3TieBreakerPointsLost: setScores[2].tiebreaker,
      });
      alert('Match result saved successfully!');
      // Reset form
      setSelectedOpponent('');
      setSetScores([
        { player1: 0, player2: 0, tiebreaker: 0 },
        { player1: 0, player2: 0, tiebreaker: 0 },
        { player1: 0, player2: 0, tiebreaker: 0 }
      ]);
    } catch (error) {
      console.error('Error saving match result:', error);
      alert('Failed to save match result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View style={{ flex: 1 }}>
          <ScrollView className="p-4" style={{ flex: 1 }}>
            <Text className="text-2xl font-bold mb-4">Enter Match Score</Text>
            
            {/* Opponent Selection */}
            <View className="mb-4">
              <Text className="text-lg mb-2">Select Opponent:</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                className="border border-gray-300 rounded-lg bg-white p-4"
                disabled={loading}
              >
                <Text className="text-gray-800">
                  {loading ? 'Loading opponents...' : selectedOpponentName}
                </Text>
              </TouchableOpacity>
              {error && (
                <Text className="text-red-500 mt-2">Error loading opponents</Text>
              )}
            </View>

            {/* Picker Modal */}
            <Modal
              visible={showPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-2xl p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-semibold">Select Opponent</Text>
                    <Text className="text-lg font-semibold">{selectedOpponentName}</Text>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text className="text-blue-500">Done</Text>
                    </TouchableOpacity>
                  </View>
                  {loading ? (
                    <View className="h-40 justify-center items-center">
                      <Text>Loading opponents...</Text>
                    </View>
                  ) : error ? (
                    <View className="h-40 justify-center items-center">
                      <Text className="text-red-500">Error loading opponents</Text>
                    </View>
                  ) : (
                    <Picker
                      selectedValue={selectedOpponent}
                      onValueChange={(itemValue: string, itemIndex: number) => {
                        setSelectedOpponent(itemValue);
                        setSelectedOpponentName(playersData?.documents[itemIndex-1] ? playersData?.documents[itemIndex-1].player.name : 'Select an opponent');
                      }}
                      style={{ height: 200 }}
                      itemStyle={{ fontSize: 16 }}
                    >
                      <Picker.Item 
                        label="Select an opponent" 
                        value="" 
                        color="#666"
                      />
                      {playersData?.documents?.map((member: any) => (
                        user && user.$id !== member.player.$id && (
                          <Picker.Item 
                            key={member.player.$id} 
                            label={member.player.name}
                            value={member.player.$id}
                            color="#000"
                          />
                        )
                      ))}
                    </Picker>
                  )}
                </View>
              </View>
            </Modal>

            {/* Set Scores */}
            <View className="mb-4">
              <Text className="text-xl font-semibold mb-2">Enter Set Scores:</Text>
              {[0, 1, 2].map((index) => (
                <SetScoreInput
                  key={index}
                  setNumber={index + 1}
                  scores={setScores[index]}
                  onScoreChange={(player, score) => handleScoreChange(index, player, score)}
                  onTieBreakerChange={(score) => handleTieBreakerChange(index, score)}
                  hasWinner={HasWininTwo}
                  ErrMessage={message[index]}
                  showTiebreaker={
                    index === 0 ? set1tiebreaker : 
                    index === 1 ? set2tiebreaker : 
                    set3tiebreaker
                  }
                />
              ))}
            </View>
          </ScrollView>

          {/* Submit Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`bg-blue-500 p-4 rounded-lg ${
                isSubmitting ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isSubmitting ? 'Saving...' : 'Save Match Result'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
