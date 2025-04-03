import { View, Text, ScrollView, Alert, TouchableOpacity, Button, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser } from '@/lib/appwrite'
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
    LeagueCode: string;
  }

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({mode: 'onChange'});

  if (!loading && isLoggedIn) {
    return <Redirect href="/" />;
  }

  const handleRegister = async (data: FormData) => {
    if (isLoading) return;
    console.log('Register attempt with:', data);
    
    try {
      setIsLoading(true);
      const regex = /^([a-zA-Z0-9]{5})$/;

      if(!regex.test(data.LeagueCode)){
        console.log('yep');
        setLeagueCode('Invalid League Code. Please try again or Leave Blank.');
        return;
      }

      const result = await registerUser(data.Email, data.Password, data.Name, data.LeagueCode);

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
      <ScrollView pointerEvents="box-none">
        {/* Welcome Text */}
<View className="flex-col items-center mt-8 mb-4">
  <Text className="text-base text-black">Welcome to</Text>
  <Text className="text-3xl font-bold" style={{ color: '#2E8B57' }}>Rally Rank</Text>
</View>

{/* Create Account Text */}
<Text className="text-xl text-center text-gray-700 mt-4 mb-8">
  Create Your Account
</Text>

        <View style={styles.container}>
          <Controller
            control={control}
            name="Name"
            rules={{
              required: 'Name is Required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
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
            <Text className="text-red-500">
              {errors.Name.message}
            </Text>
          )}

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
            <Text className="text-red-500">
              {errors.Email.message}
            </Text>
          )}

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
            <Text className="text-red-500">
              {errors.Password.message}
            </Text>
          )}
           <Controller
            control={control}
            name="LeagueCode"
            rules={{
              minLength: {
                value: 5,
                message: 'League Code must be 5 characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="LeagueCode"
              />
            )}
          />
           {leagueCode.length > 0 && (
            <Text className="text-red-500">
               {leagueCode}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Register"
              onPress={handleSubmit(handleRegister)}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default Register; 