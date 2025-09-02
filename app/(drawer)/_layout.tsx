import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Button, Text, View} from "react-native";
import { useGlobalContext } from "../../lib/global-provider";
import { Redirect, router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { verifyEmail, getCurrentUser, account } from "../../lib/appwrite";

const Layout =()=>{
    const {loading, isLoggedIn, user, refetch} = useGlobalContext();
    const verificationIntervalRef = useRef<number | null>(null);

    // Email verification listener
    useEffect(() => {
        if (isLoggedIn && user && !user.emailVerified) {
            // Start polling for email verification status
            verificationIntervalRef.current = setInterval(async () => {
                try {
                    const currentUser = await getCurrentUser();
                    if (currentUser && currentUser.emailVerified) {
                        // Email verified! Refresh the app
                        console.log('Email verified! Refreshing app...');
                        refetch();
                        if (verificationIntervalRef.current) {
                            clearInterval(verificationIntervalRef.current);
                            verificationIntervalRef.current = null;
                        }
                    }
                } catch (error) {
                    console.error('Error checking email verification status:', error);
                }
            }, 3000); // Check every 3 seconds
        }

        // Cleanup interval on unmount or when user logs out
        return () => {
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
                verificationIntervalRef.current = null;
            }
        };
    }, [isLoggedIn, user?.emailVerified, refetch]);

    const handleLogout = async () => {
        try {
          await account.deleteSession('current');
          refetch();
          router.replace('/sign-in');
        } catch (error) {
          console.error('Logout error:', error);
        }
      }

    if(loading) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center" >
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        )
    }

    if(!isLoggedIn) {
        return <Redirect href="/sign-in" />
    }
    else if(isLoggedIn && !user?.emailVerified) {
        if(user?.email){
            verifyEmail(user.email);
        }
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <View className="flex items-center">
                    <Text className="text-center">Before continuing, you must verify your email. Please Click the Link in the email to verify your Email.</Text>
                </View>
                <View className="mt-8 mb-4 px-4 items-center">
                <Button
              title="Logout"
              onPress={handleLogout}
            />
          </View>
                
            </SafeAreaView>
        );
    }
    else {
        return(
            <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer>
                <Drawer.Screen 
                    name="(tabs)" 
                    options={{
                        headerShown: true, 
                        drawerLabel: 'Home', 
                        title: 'Rally Rank',
                        headerTitle: 'Rally Rank'
                    }} 
                />
                <Drawer.Screen 
                    name="Profile" 
                    options={{
                        headerShown: true, 
                        drawerLabel: 'Profile', 
                        title: 'Profile',
                        headerTitle: 'Profile'
                    }} 
                />
            </Drawer>
            </GestureHandlerRootView>
        )
    }
}

export default Layout;