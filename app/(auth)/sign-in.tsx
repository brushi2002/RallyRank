import { View, Text, ScrollView, Image, Alert, TouchableOpacity, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native'
import * as React from 'react'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { loginwithEmail } from '../../lib/appwrite'
import { useGlobalContext } from '../../lib/global-provider'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import Carousel from 'react-native-reanimated-carousel'
import Purchases, {LOG_LEVEL} from "react-native-purchases";
import OnboardingFlow from '../../components/OnBoardingFlow';
import AsyncStorage from '@react-native-async-storage/async-storage';




const SignIn = ({showHeaderImage = true}: {showHeaderImage?: boolean}) => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const width = Dimensions.get('window').width;

  // Check onboarding status on mount
  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding === 'true') {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    // Redirect to register page for first-time users
    router.push('/(auth)/register');
  };
  
  // Sample images for the carousel - using existing images for now
  const images = [
    { id: 1, source: require('../../assets/images/tennis1.jpg') },
    { id: 2, source: require('../../assets/images/tennis2.jpg') },
    { id: 3, source: require('../../assets/images/tennis3.jpg') },
  ];

  interface FormData {
    Email: string;
    Password: string;
  }
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({mode: 'onChange'});

  if (!loading && isLoggedIn) {
    return <Redirect href="/" />;
  }

  // Show onboarding if user hasn't seen it yet
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const handleLogin = async (data: FormData) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await loginwithEmail(data.Email, data.Password);
      await refetch();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <SafeAreaView className="bg-white flex-1">
      <ScrollView pointerEvents="box-none" className="flex-1">

      {/* Welcome Text */}
      {showHeaderImage && (
      <View className="flex-col items-center mt-8 mb-4">
        <Text className="text-base text-black">Welcome to</Text>
        <Text className="text-3xl font-bold" style={{ color: '#2E8B57' }}>Rally Rank</Text>

        {/* Simple Image Display */}
        <View className="h-48 mb-8 justify-center items-center">
          <Image
            source={images[0].source}
            style={{ width: width - 40, height: 180, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View> 
        </View>
        )}

        {/* Login Form */}
        <KeyboardAvoidingView className="px-8"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Text className="text-center text-gray-600 mb-4">
            Sign in to your account
          </Text>
          
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
                style={styles.textInput}
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

          <Controller
            control={control}
            name="Password"
            rules={{
              required: 'Password is Required'
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                textContentType="password"
                style={styles.textInput}
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

          <TouchableOpacity
            className="bg-gray-200 py-4 rounded-lg mt-4"
            onPress={handleSubmit(handleLogin)}
            disabled={isLoading}
          >
            <Text className="text-center text-gray-800 text-lg">
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          {/* Sign Up Link */}
          <View className="mt-6">
            <Text className="text-center text-gray-600">
              Don't have an account?{' '}
              <Text 
                className="text-blue-500 font-semibold"
                onPress={() => router.push('/(auth)/register')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
        <View>
          </View>
      {/* Your login form */}
      
      {/* Debug info - remove in production 
      <View style={{ padding: 10, backgroundColor: 'yellow' }}>
        <Text>Debug Info:</Text>
        <Text>Endpoint: {process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'NOT SET'}</Text>
        <Text>Project: {process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'NOT SET'}</Text>
      </View>
      */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textInput: {
    height: 50,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    color: '#000000',
  
  },
});

export default SignIn;