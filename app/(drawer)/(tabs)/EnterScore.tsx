import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, StyleSheet, TextInput, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { getPlayersExcludingCurrentUser, createMatchResult } from '../../../lib/appwrite';
import { useAppwrite } from '../../../lib/useAppwrite';
import { useGlobalContext } from '../../../lib/global-provider';
import { useFocusEffect } from '@react-navigation/native';

interface SetScore {
  player1: number;
  player2: number;
  tiebreaker: number | null;
}

const ScoreButton = ({ 
  value, 
  isSelected, 
  onPress 
}: { 
  value: number, 
  isSelected: boolean, 
  onPress: () => void 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.scoreButton,
        isSelected ? styles.selectedScoreButton : styles.unselectedScoreButton
      ]}
    >
      <Text style={[
        styles.scoreButtonText,
        isSelected ? styles.selectedScoreButtonText : styles.unselectedScoreButtonText
      ]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

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
  const shouldShow = !(hasWinner && setNumber === 3);
  
  if (!shouldShow) return null;

  return (
    <View style={styles.setContainer}>
      <Text style={styles.setTitle}>Set {setNumber}:</Text>
      
      <View style={styles.scoresRow}>
        <View style={styles.playerScoreSection}>
          <Text style={styles.playerLabel} numberOfLines={1}>Your Score</Text>
          <View style={styles.scoreGrid}>
            {[0, 1, 2].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player1 === value}
                onPress={() => onScoreChange('player1', value)}
              />
            ))}
          </View>
          <View style={styles.scoreGrid}>
            {[3, 4, 5].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player1 === value}
                onPress={() => onScoreChange('player1', value)}
              />
            ))}
          </View>
          <View style={styles.scoreGrid}>
            {[6, 7].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player1 === value}
                onPress={() => onScoreChange('player1', value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.playerScoreSection}>
          <Text style={styles.playerLabel} numberOfLines={1}>Opponent</Text>
          <View style={styles.scoreGrid}>
            {[0, 1, 2].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player2 === value}
                onPress={() => onScoreChange('player2', value)}
              />
            ))}
          </View>
          <View style={styles.scoreGrid}>
            {[3, 4, 5].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player2 === value}
                onPress={() => onScoreChange('player2', value)}
              />
            ))}
          </View>
          <View style={styles.scoreGrid}>
            {[6, 7].map((value) => (
              <ScoreButton
                key={value}
                value={value}
                isSelected={scores.player2 === value}
                onPress={() => onScoreChange('player2', value)}
              />
            ))}
          </View>
        </View>
      </View>

      {showTiebreaker && (
        <View style={styles.tiebreakerContainer}>
          <Text style={styles.tiebreakerLabel}>Tiebreaker Points of Loser:</Text>
          <TextInput
            style={styles.tiebreakerInput}
            onChangeText={(text) => onTieBreakerChange(parseInt(text) || 0)}
            placeholder="0"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
      )}
      
      {ErrMessage ? (
        <Text style={styles.errorText}>{ErrMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    position: 'absolute',
    top: -300,
    left: -150,
    width: 600,
    height: 500,
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
    opacity: 0.2,
    borderRadius: 300,
  },
  gradientLayer2: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: '80%',
    height: '80%',
    backgroundColor: '#EFEEBC',
    opacity: 0.15,
    borderRadius: 250,
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 38,
    paddingTop: 24,
    paddingBottom: 18,
  },
  headerTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    color: '#316536',
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 41,
    marginBottom: 32,
  },
  inputField: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E4E5E7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  inputText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: '#316536',
    letterSpacing: -0.14,
    textAlignVertical: 'top',
    includeFontPadding: false,
    flex: 0,
  },
  scoresContainer: {
    paddingHorizontal: 38,
    marginTop: -8,
  },
  scoresTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    color: '#316536',
    marginBottom: 8,
  },
  setContainer: {
    marginBottom: 24,
  },
  setTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#316536',
    lineHeight: 19.6,
    letterSpacing: -0.14,
    marginBottom: 21,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  playerScoreSection: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '400',
    color: '#316536',
    lineHeight: 14,
    letterSpacing: -0.14,
    marginBottom: 16,
    numberOfLines: 1,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  scoreButton: {
    width: 43,
    height: 34,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScoreButton: {
    backgroundColor: '#316536',
  },
  unselectedScoreButton: {
    backgroundColor: '#E5E7EB',
  },
  scoreButtonText: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '400',
  },
  selectedScoreButtonText: {
    color: '#FFFFFF',
  },
  unselectedScoreButtonText: {
    color: '#316536',
  },
  tiebreakerContainer: {
    marginTop: 16,
  },
  tiebreakerLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: '#316536',
    marginBottom: 8,
  },
  tiebreakerInput: {
    width: 70,
    height: 40,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    fontFamily: 'Rubik',
    fontSize: 14,
    color: '#316536',
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  saveButton: {
    marginHorizontal: 36,
    marginBottom: 48,
    marginTop: 16,
    height: 44,
    borderRadius: 30,
    backgroundColor: '#316536',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#182A58',
    shadowOffset: { width: 10, height: 30 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  saveButtonText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  pickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#316536',
  },
  doneButton: {
    fontSize: 16,
    color: '#316536',
    fontWeight: '500',
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
  const [selectedOpponentName, setSelectedOpponentName] = useState('Name');

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedOpponent('');
        setSelectedOpponentName('Name');
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
    fn: () => getPlayersExcludingCurrentUser(user?.leagueinfo.league.$id || '', user?.$id || ''),
    skip: false
  });

  const handleTieBreakerChange = (setIndex: number, score: number) => {
    const newScores = [...setScores];
    newScores[setIndex] = {
      ...newScores[setIndex],
      tiebreaker: score
    };
    setSetScores(newScores);
  };

  const handleScoreChange = (setIndex: number, player: 'player1' | 'player2', score: number) => {
    const newScores = [...setScores];
    newScores[setIndex] = {
      ...newScores[setIndex],
      [player]: score
    };
    setSetScores(newScores);

    // Check if the same player won the first 2 sets
    if(((newScores[0].player1 == 6 && newScores[0].player2 != 7) || newScores[0].player1 == 7) && ((newScores[1].player1 == 6 && newScores[1].player2 != 7) || newScores[1].player1 == 7)) {
      setHasWininTwo(true);
      setWinner('player1');
      setSet3tiebreaker(false);
      newScores[2].player1 = 0;
      newScores[2].player2 = 0;
    }
    else if(((newScores[0].player2 == 6 && newScores[0].player1 != 7) || newScores[0].player2 == 7) && ((newScores[1].player2 == 6 && newScores[1].player1 != 7) || newScores[1].player2 == 7)) {
      setHasWininTwo(true);
      setWinner('player2');
      setSet3tiebreaker(false);
      newScores[2].player1 = 0;
      newScores[2].player2 = 0;
    }
    else {
      setHasWininTwo(false);
      if((newScores[2].player1 == 6 && newScores[2].player2 != 7) || (newScores[2].player1 == 7)) {
        setWinner('player1');
      }
      else if((newScores[2].player2 == 6 && newScores[2].player1 != 7) || (newScores[2].player2 == 7)) {
        setWinner('player2');
      }
    }

    const regex = /^(6-[0-4]|7-[5-6]|7-6|[0-4]-6|[5-6]-7|6-7)$/;
    let set1Score = newScores[0].player1 + "-" + newScores[0].player2
    let set2Score = newScores[1].player1 + "-" + newScores[1].player2
    let set3Score = newScores[2].player1 + "-" + newScores[2].player2

    if(!regex.test(set1Score)) {
      setMessage(["Set 1 doesn't have a winner", "", ""])
    }
    else if(!regex.test(set2Score)) {
      setMessage(["", "Set 2 doesn't have a winner", ""])
    }
    else if(!HasWininTwo && !regex.test(set3Score)) {
      setMessage(["", "", "Set 3 doesn't have a winner"])
    }
    else {
      setMessage(["", "", ""])
    }

    const regextiebreaker = /^(7-6|6-7)$/;
    if(regextiebreaker.test(set3Score) && !HasWininTwo) {
      setSet3tiebreaker(true);
    }
    else {
      setSet3tiebreaker(false);
    }
    if(regextiebreaker.test(set2Score)) {
      setSet2tiebreaker(true);
    }
    else {
      setSet2tiebreaker(false);
    }
    if(regextiebreaker.test(set1Score)) {
      setSet1tiebreaker(true);
    }
    else {
      setSet1tiebreaker(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOpponent) {
      alert('Please select an opponent');
      return;
    }
    
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

    if(((setScores[0].tiebreaker == null || setScores[0].tiebreaker == 0) && set1tiebreaker == true) || ((setScores[1].tiebreaker == null || setScores[1].tiebreaker == 0) && set2tiebreaker == true) || ((setScores[2].tiebreaker == null || setScores[2].tiebreaker == 0) && set3tiebreaker == true && !HasWininTwo)) {
      alert('Please enter a tiebreaker score');
      return;
    }
    
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
      setSelectedOpponentName('Name');
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
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Green Gradient Background */}
        <View style={styles.gradientBackground}>
          <View style={styles.gradientLayer1} />
          <View style={styles.gradientLayer2} />
        </View>
      
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select Opponent:</Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.inputField}
            disabled={loading}
          >
            <Text style={styles.inputText}>
              {loading ? 'Loading opponents...' : selectedOpponentName}
            </Text>
          </TouchableOpacity>
          {error && (
            <Text style={styles.errorText}>Error loading opponents</Text>
          )}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Scores Section */}
          <View style={styles.scoresContainer}>
            <Text style={styles.scoresTitle}>Enter Set Scores:</Text>

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

        {/* Save Button */}
        <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
          style={[styles.saveButton, isSubmitting && { opacity: 0.5 }]}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Match Result'}
          </Text>
        </TouchableOpacity>

        {/* Picker Modal */}
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Opponent</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>Loading opponents...</Text>
                </View>
              ) : error ? (
                <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.errorText}>Error loading opponents</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedOpponent}
                  onValueChange={(itemValue: string) => {
                    console.log('Selected itemValue:', itemValue);
                    setSelectedOpponent(itemValue);
                    if (itemValue && playersData?.documents) {
                      const selectedPlayer = playersData.documents.find((member: any) => member.player.$id === itemValue);
                      console.log('Found player:', selectedPlayer?.player.name);
                      setSelectedOpponentName(selectedPlayer ? selectedPlayer.player.name : 'Name');
                    } else {
                      setSelectedOpponentName('Name');
                    }
                    setShowPicker(false);
                  }}
                  style={{ height: 200 }}
                  itemStyle={{ fontSize: 16 }}
                >
                  <Picker.Item
                    label="Select opponent"
                    value=""
                    color="#666"

                  />
                  {playersData?.documents?.map((member: any) => (
                    user && user.$id !== member.player.$id && (
                      <Picker.Item
                        key={member.player.$id}
                        label={member.player.name}
                        value={member.player.$id}
                        color="#316536"
                      />
                    )
                  ))}
                </Picker>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
