import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser, doesLadderCodeExist, doesEmailExist, verifyEmail } from '../../lib/appwrite'
import { useGlobalContext } from '../../lib/global-provider'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import PhoneInput, {isValidPhoneNumber}  from 'react-native-international-phone-number';
import { LocationData, getLocationData } from '../../lib/geolocationApi';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';




const Register = () => {

  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leagueCode, setLeagueCode] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({mode: 'onChange'});
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await getLocationData();
        setLocation(locationData);
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocation(null);
      }
    };
    fetchLocation();
  }, []);
  interface FormData {
    Name: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
    LadderName: string;
    LadderDescription: string;
    LadderCode: string;
  }


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

      if (!location) {
        Alert.alert('Error', 'Location data not available. Please try again.');
        return;
      }
      const result = await registerUser(data.Email, data.Password, data.Name, data.LadderCode, data.PhoneNumber, location.City, location.County, location.State, location.Country, location.DeviceType);
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
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Register & Create New Ladder</Text>
        </View>

        {/* Form Container */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
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
                  placeholderTextColor="#999"
                />
              )}
            />
            {errors.Name && (
              <Text style={styles.errorText}>{errors.Name.message}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
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
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.Email && (
              <Text style={styles.errorText}>{errors.Email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
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
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              )}
            />
            {errors.Password && (
              <Text style={styles.errorText}>{errors.Password.message}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <Controller
              name="PhoneNumber"
              control={control}
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.phoneInputContainer}>
                  <PhoneInput
                    defaultCountry="US"
                    value={value}
                    onChangePhoneNumber={onChange}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry={setSelectedCountry}
                    visibleCountries={['US', 'AU']}
                    phoneInputStyles={{
                      container: styles.phoneContainer,
                      input: styles.phoneInput,
                    }}
                  />
                </View>
              )}
            />
            {errors.PhoneNumber && (
              <Text style={styles.errorText}>{errors.PhoneNumber.message}</Text>
            )}
          </View>

          {/* Ladder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ladder Name</Text>
            <Controller
              control={control}
              name="LadderName"
              rules={{
                required: 'Ladder Name is Required',
                minLength: {
                  value: 2,
                  message: 'Ladder Name must be at least 2 characters'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ladder Name"
                  placeholderTextColor="#999"
                />
              )}
            />
            {errors.LadderName && (
              <Text style={styles.errorText}>{errors.LadderName.message}</Text>
            )}
          </View>

          {/* Ladder Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ladder Description</Text>
            <Controller
              control={control}
              name="LadderDescription"
              rules={{
                required: 'Ladder Description is Required',
                minLength: {
                  value: 10,
                  message: 'Ladder Description must be at least 10 characters'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ladder Description"
                  placeholderTextColor="#999"
                />
              )}
            />
            {errors.LadderDescription && (
              <Text style={styles.errorText}>{errors.LadderDescription.message}</Text>
            )}
          </View>

          {/* Ladder Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ladder Code (For Inviting Members)</Text>
            <Controller
              control={control}
              name="LadderCode"
              rules={{
                required: 'Ladder Code is Required',
                minLength: {
                  value: 4,
                  message: 'Ladder Code must be 4 characters long'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ladder Code"
                  placeholderTextColor="#999"
                  maxLength={4}
                  autoCapitalize="characters"
                />
              )}
            />
            {errors.LadderCode && (
              <Text style={styles.errorText}>{errors.LadderCode.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(handleRegister)}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Registering...' : 'Register + Create Ladder'}
            </Text>
          </TouchableOpacity>
          
        </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  phoneInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  phoneContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: 48,
  },
  phoneInput: {
    backgroundColor: 'transparent',
    color: '#333',
    fontSize: 16,
    height: 48,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});


export default Register; 