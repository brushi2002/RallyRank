import { View, Text, ScrollView, Image, Alert, TouchableOpacity, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import * as React from 'react'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerUser, doesLadderCodeExist, doesEmailExist } from '../../lib/appwrite'
import { useGlobalContext } from '../../lib/global-provider'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import PhoneInput from 'react-native-international-phone-number'
import { LocationData, getLocationData } from '../../lib/geolocationApi'
import { BlurView } from 'expo-blur'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingFlow from '../../components/OnBoardingFlow'
import { loginwithEmail } from '../../lib/appwrite'

const SignIn = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

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
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Background */}
      <View style={styles.background}>

        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>Rally Rank</Text>
          <Text style={styles.tagline}>Your game, your rank, your rally.</Text>
        </View>

        {/* Tennis Ball Image */}
        <Image
          source={require('../../assets/images/TennisBall.png')}
          style={styles.tennisBall}
          resizeMode="cover"
        />

        {/* Tennis Court Background Image */}
        <Image
          source={require('../../assets/images/SignInScreenBackground.png')}
          style={styles.tennisCourtImage}
          resizeMode="cover"
          height={492}
        />

        {/* Form Container */}
        <View style={styles.formContainer} >
          <BlurView intensity={30} style={styles.blurContainer}>
            
            {/* Welcome Text */}
            <Text style={styles.welcomeTitle}>Welcome Tennis Champ!</Text>
            <Text style={styles.welcomeSubtitle}>
              In order to create a ladder and track your progress, we need some info from you first.
            </Text>

            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
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
                      placeholder=""
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
                <View style={styles.inputUnderline} />
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
                      placeholder=""
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                    />
                  )}
                />
                <View style={styles.inputUnderline} />
                {errors.Password && (
                  <Text style={styles.errorText}>{errors.Password.message}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(handleLogin)}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <TouchableOpacity onPress={() => router.push('/register')} style={styles.signInContainer}>
                <Text style={styles.signInText}>
                  Don't have an account?
                  <Text style={styles.signInLinkText}> Click here to Register</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Social Login Buttons */}
            {/*<View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            {/*<TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>
                Forgot your e-mail or password? 
                <Text style={styles.resetLinkText}> Reset here</Text>
              </Text>
            </TouchableOpacity>
              */}
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#316536',
  },
  background: {
    flex: 1,
    backgroundColor: '#316536',
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: 'Rubik',
    textAlign: 'center',
    marginTop: 8,
  },
  tennisBall: {
    position: 'absolute',
    top: 150,
    right: -20,
    width: 180,
    height: 126 ,
    transform: [{ rotate: '17.812deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tennisCourtImage: {
    position: 'absolute',
    bottom: -100,
    left: -40,
    width: 450,
    height: 250,
    opacity: 0.8,
  },
  formContainer: {
    position: 'absolute',
    left: 0,
    top: 196,
    width: 348,
    height: 500,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    padding: 20,
    borderRadius: '0 30px 30px 0',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: 'Rubik',
    marginBottom: 20,
    lineHeight: 16,
  },
  formScrollView: {
    flex: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  input: {
    height: 30,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Rubik',
    paddingVertical: 0,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#FFF',
    marginTop: 5,
    width: 227,
  },
  phoneInputContainer: {
    backgroundColor: 'transparent',
  },
  phoneContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: 30,
  },
  phoneInput: {
    backgroundColor: 'transparent',
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Rubik',
  },
  submitButton: {
    width: 161,
    height: 35,
    backgroundColor: '#FFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#316536',
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Rubik',
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    width: 237,
    height: 35,
    backgroundColor: '#FFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  socialButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rubik',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-start',
  },
  forgotPasswordText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rubik',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  resetLinkText: {
    color: '#EFEEBC',
  },
  signInContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  signInText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  signInLinkText: {
    color: '#EFEEBC',
    textDecorationLine: 'underline',
  },
});

export default SignIn;
