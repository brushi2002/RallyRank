import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser, doesLadderCodeExist, doesEmailExist } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'


const Register = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [leagueCode, setLeagueCode] = useState('');

  interface FormData {
    Email: string;
    Password: string;
    Name: string;
    LadderCode: string;
    PhoneNumber: string;
  }

  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({mode: 'onChange'});

  if (!loading && isLoggedIn) {
    return <Redirect href="/" />;
  }

  const serverValidation = async (data: FormData, errors: any) => {
    console.log('Running Sever side Validations')
    try{
      if(!await doesLadderCodeExist(data.LadderCode)) {
        setError('LadderCode', {message: 'Ladder Code does not exist'});
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

  const handleRegister = async (data: FormData) => {
    if (isLoading) return;
    console.log('Register attempt with:', data);
    
    try {
      if(!await serverValidation(data, errors)) {
        return;
      }
      setIsLoading(true);
      const regex = /^([a-zA-Z0-9]{5})$/;

      const result = await registerUser(data.Email, data.Password, data.Name, data.LadderCode, data.PhoneNumber);

      if(result == null){
        setLeagueCode('Invalid League Code. Please try again.');
        return;
      }
      setLeagueCode('');
      Alert.alert('Success', 'Registration successful! Please login.');
      router.push('/sign-in');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView pointerEvents="box-none" className="flex-1">
        {/* Welcome Text */}
        <View className="flex-col items-center mt-8 mb-4">
          <Text className="text-base text-black">Welcome to</Text>
          <Text className="text-3xl font-bold" style={{ color: '#2E8B57' }}>Rally Rank</Text>
        </View>

        {/* Create Account Text */}
        <Text className="text-xl text-center text-gray-700 mt-4 mb-8">
          Create Your Account
        </Text>
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
                placeholder="PhoneNumber"
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
          </View>

          <TouchableOpacity
            className="bg-gray-200 py-4 rounded-lg mt-4"
            onPress={handleSubmit(handleRegister)}
            disabled={isLoading}
          >
            <Text className="text-center text-gray-800 text-lg">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="mt-6">
            <Text className="text-center text-gray-600">
              Already have an account?{' '}
              <Text 
                className="text-blue-500 font-semibold"
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Sign in
              </Text>
            </Text>
          </View>
          {/* Create a Ladder */}
            <View className="mt-6">
              <Text className="text-center text-gray-600">
                No League Code? 
              </Text>
              <Text className="text-center text-gray-600">
                Subscribe and Create a Ladder
              </Text>
              <Text 
                className="text-blue-500 font-semibold text-center"
                onPress={() => router.push('/(auth)/CreateLadder')}
              >
                Create a new Ladder
              </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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

export default Register; 