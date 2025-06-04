import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createLadder, databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { GlobalProvider, useGlobalContext } from '@/lib/global-provider';
 
export default function CreateLadder() {
  const { user } = useGlobalContext();
  const [ladderName, setLadderName] = useState('');
  const [description, setDescription] = useState('');
  const [ladderCode, setLadderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log(user?.labels)
  let isAdmin = false;
  if(user?.labels?.includes('admin')){
    isAdmin = true;
  }


  const handleCreateLadder = async () => {
    if (!ladderName.trim()) {
      Alert.alert('Error', 'Please enter a ladder name');
      return;
    }

   
    try {
      setLoading(true);
      // Create a new ladder in the database
      const response = await createLadder({
        Name: ladderName,
        Description: description,
        LadderCode: ladderCode,
        CreateDate: new Date().toISOString(),
      });

      console.log('Ladder created:', response);
      
      Alert.alert(
        'Success',
        'Ladder created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/LadderStandings'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating ladder:', error);
      Alert.alert('Error', 'Failed to create ladder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    isAdmin ? (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Create New Ladder</Text>
        </View>
        
        <ScrollView className="flex-1 p-4">
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Ladder Name</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3"
              placeholder="Enter ladder name"
              value={ladderName}
              onChangeText={setLadderName}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Description</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3"
              placeholder="Enter ladder description"
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>
          <Text className="text-gray-700 font-medium mb-1">Ladder Code (for Inviting Members)</Text>
          <View className="mb-6">
          <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3"
              placeholder="Enter Ladder Code"
              value={ladderCode}
              onChangeText={setLadderCode}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            className="bg-blue-500 rounded-lg p-4 items-center"
            onPress={handleCreateLadder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Ladder</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
    ) : (
      <View>
        <Text>You are not authorized to create ladders</Text>
      </View>
    )
  );
} 