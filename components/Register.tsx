import { View, Text, ScrollView, Alert, TouchableOpacity, Button, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'

const Register = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  interface FormData {
    Email: string;
    Password: string;
    Name: string;
    LeagueCode: string;
    PhoneNumber: string;
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
      await registerUser(data.Email, data.Password, data.Name, data.LeagueCode, data.PhoneNumber);
      Alert.alert('Success', 'Registration successful! Please login.');
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
        <Text className="text-base text-center uppercase font-rubik text-black-200">  
          Welcome to Tennis App
        </Text>

        <Text className="text-3xl text-center font-rubik-bold text-black-300 text-center mt-2">
          Create Your Account{"\n"}
        </Text>

        <View style={styles.container}>
          <Text style={styles.header}>Register</Text>
          
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
              required: 'League Code is Required',
              minLength: {
                value: 3,
                message: 'League Code must be at least 3 characters'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="League Code"
              />
            )}
          />
          {errors.LeagueCode && (
            <Text className="text-red-500">
              {errors.LeagueCode.message}
            </Text>
          )}

          <Controller
            control={control}
            name="PhoneNumber"
            rules={{
              required: 'Phone Number is Required',
              pattern: {
                value: /^[\+]?[1-9][\d]{0,15}$/,
                message: "Invalid phone number format"
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.PhoneNumber && (
            <Text className="text-red-500">
              {errors.PhoneNumber.message}
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