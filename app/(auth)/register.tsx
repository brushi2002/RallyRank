import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser, doesLadderCodeExist, doesEmailExist, verifyEmail } from '../../lib/appwrite'
import { useGlobalContext } from '../../lib/global-provider'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Image } from 'react-native';
import PhoneInput, {isValidPhoneNumber}  from 'react-native-international-phone-number';

const Register = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [leagueCode, setLeagueCode] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

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
      await verifyEmail(data.Email);
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

  function handleInputValue(phoneNumber: string) {
    setPhone(phoneNumber);
  }

  function handleSelectedCountry(country: any) {
    setSelectedCountry(country);
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView pointerEvents="box-none" className="flex-1">
        {/* Welcome Text */}
        <View className="flex-col items-center mt-8 mb-4">
          <Text className="text-base text-black">Welcome to</Text>
          <Text className="text-3xl font-bold" style={{ color: '#2E8B57' }}>Rally Rank</Text>
        </View>

        {/* Create Account Text */}
        <KeyboardAvoidingView className="px-8"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text className="text-xl text-center text-gray-700 mt-4 mb-8">
          Create Your Account
        </Text>
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
                textContentType="emailAddress"
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
        
        <Text className="text-gray-700 font-medium mb-1">Phone Number</Text>
        <Controller
        name="PhoneNumber"
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <PhoneInput
            defaultCountry="US"
            defaultValue="+17149914008"
            value={value}
            onChangePhoneNumber={onChange}
            selectedCountry={selectedCountry}
            onChangeSelectedCountry={handleSelectedCountry}
            visibleCountries={['US','AU']}
          />
        )}
      />

      <View style={{ marginTop: 10 }}>
          <Text>
            Country:{' '}
            {selectedCountry ? `${selectedCountry.translations?.eng?.common} (${selectedCountry.cca2})` : 'Not selected'}
          </Text>
          <Text>
            Phone Number: {selectedCountry ? `${selectedCountry.idd?.root} ${phone}` : phone}
          </Text>
          <Text>
            {phone && selectedCountry ? (isValidPhoneNumber(phone, selectedCountry) ? 'true' : 'Please Enter a Valid Phone Number') : 'false'}
          </Text>
        </View>

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
                textContentType="password"
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
          </KeyboardAvoidingView>
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