import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createLadder, databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { GlobalProvider, useGlobalContext } from '@/lib/global-provider';
import Purchases, {LOG_LEVEL} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { registerUser, doesLadderCodeExist, doesEmailExist } from '@/lib/appwrite'
import { Controller, useForm } from 'react-hook-form';

interface FormData {
  Email: string;
  Password: string;
  Name: string;
  PhoneNumber: string;
  LadderCode: string;
  LadderName: string;
  Description: string;
}


async function presentPaywallIfNeeded() {
  // Present paywall for current offering:
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: "entla0ee6b744d"
  });
  console.log('***************************************************Paywall Result:', paywallResult);
}

export default function CreateLadder() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: "appl_ScXuRrRgmmQzOxyXwbKlMzBpggx"});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: "goog_vmfFCcruMvGtMyvcXxbDhXMJIHr"});
    }

  }, []);

  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({mode: 'onChange'});
  
  const serverValidation = async (data: FormData, errors: any) => {
    console.log('Running Sever side Validations')
    try{
      if(await doesLadderCodeExist(data.LadderCode)) {
        setError('LadderCode', {message: 'Ladder Code already exists'});
        errors.LadderCode = 'Ladder Code already exists';
        return false;
      }
      if(await doesEmailExist(data.Email)) {
        setError('Email', {message: 'Email already exists'});
        return false;
      }
      return true;
    }
    catch(error){
      console.log('Error running server side validations', error);
    }
  }
  //const { user } = useGlobalContext();
  const [ladderName, setLadderName] = useState('');
  const [description, setDescription] = useState('');
  const [ladderCode, setLadderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPaywall, setLoadingPaywall] = useState(false);
  const router = useRouter();

  const handleCreateLadder = async (data: FormData) => {
    try {
      console.log('***************************************************Checking if user has access to create ladders');
     const customerInfo = await Purchases.getCustomerInfo();
     console.log('Customer Info:', customerInfo.entitlements);
     if(!await serverValidation(data, errors))
     {
        return;
     }
     if(typeof customerInfo.entitlements.active["Single Purchase"] !== "undefined")
     {
        // Grant user "pro" access
        console.log('User has access to create ladders');
        try {
          setLoading(true);
          console.log('email: ', data.Email);
          console.log('password: ', data.Password);
          console.log('ladderName: ', data.LadderName);
          console.log('ladderCode: ', data.LadderCode);

          
          // Create a new ladder in the database
          const response = await createLadder({
            Name: data.LadderName,
            Description: data.Description,
            LadderCode: data.LadderCode,
            CreateDate: new Date().toISOString(),
          });

          const result = await registerUser(data.Email, data.Password, data.LadderName, data.LadderCode, data.PhoneNumber);
    
          console.log('Ladder created: Please share this code with your friends to join the ladder', response);
          
          Alert.alert(
            'Success',
            'Ladder Created! Please login on the next screen. Share this code (' + data.LadderCode + ') with your friends to join the ladder!',
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
      }
      else{
        //setLoadingPaywall(true);
        await presentPaywallIfNeeded();
        setLoadingPaywall(true);
      }
    } catch (e) {
     // Error fetching purchaser info
    }
   
   
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView pointerEvents="box-none" className="flex-1">
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Register and Create New Ladder</Text>
        </View>
          <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Full Name</Text>
        <Controller
            control={control}
            name="Name"
            rules={{
              required: 'Name is Required',
              minLength: {
                value: 6,
                message: 'Name must be at least 6 characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Full Name"
              />
            )}
          />
          {errors.Name && (
            <Text className="text-red-500 mb-2">
              {errors.Name.message}
            </Text>
          )}
          </View>

        <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Phone Number</Text>
        <Controller
            control={control}
            name="PhoneNumber"
            rules={{
              pattern: {
                value: /^[2-9]\d{9}$/,
                message: "Invalid Phone Number. Format: 9876543210"
              },
              required: 'Phone Number is Required',
              minLength: {
                value: 10,
                message: 'Phone Number must be at least 10 characters'
              }

            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Phone Number"
              />
            )}
          />
          {errors.PhoneNumber && (
            <Text className="text-red-500 mb-2">
              {errors.PhoneNumber.message}
            </Text>
          )}
          </View>

          <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Email</Text>
          <Controller
            control={control}
            name="Email"
            rules={{
              required: 'Email is Required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email format"
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.Email && (
            <Text className="text-red-500 mb-2">
              {errors.Email.message}
            </Text>
          )}
          </View>
          <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Password</Text>
          <Controller
            control={control}
            name="Password"
            rules={{
              required: 'Password is Required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Password"
                secureTextEntry
              />
            )}
          />
          {errors.Password && (
            <Text className="text-red-500 mb-2">
              {errors.Password.message}
            </Text>
          )}
        </View>
          
          <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Ladder Name</Text>
          <Controller
            control={control}
            name="LadderName"
            rules={{
              required: 'Ladder Name is Required',
              minLength: {
                value: 8,
                message: 'Ladder Name must be at least 8 Characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ladder Name"
              />
            )}
          />
          {errors.LadderName && (
            <Text className="text-red-500 mb-2">
              {errors.LadderName.message}
            </Text>
          )}
          </View>
          
          <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Description</Text>
          <Controller
            control={control}
            name="Description"
            rules={{
              required: 'Description is Required',
              minLength: {
                value: 8,
                message: 'Description must be at least 8 characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Description"
              />
            )}
          />
          {errors.Description && (
            <Text className="text-red-500 mb-2">
              {errors.Description.message}
            </Text>
          )}
          </View>
          <Text className="text-gray-700 font-medium mb-1">Ladder Code (for Inviting Members)</Text>
          <Controller
            control={control}
            name="LadderCode"
            rules={{
              required: 'Ladder Code is Required',
              minLength: {
                value: 4,
                message: 'Ladder Code must be 4 Characters long'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ladder Code"
                maxLength={4}
              />
            )}
          />
          {errors.LadderCode && (
            <Text className="text-red-500 mb-2">
              {errors.LadderCode.message}
            </Text>
          )}

          
          <TouchableOpacity
            className="bg-blue-500 rounded-lg p-4 items-center"
            onPress={handleSubmit(handleCreateLadder)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Subscribe and Create Ladder</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
    ) 


} 

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
});

