import { useEffect } from "react";
import { Platform, View } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { Slot, Redirect } from "expo-router";
import Purchases, {LOG_LEVEL} from "react-native-purchases";
import RevenueCatUI from 'react-native-purchases-ui';

export default function RootLayout() {
    const {loading, isLoggedIn} = useGlobalContext();

    useEffect(() => {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    
        if (Platform.OS === 'ios') {
            console.log("getting stuff from revenuecat")
           Purchases.configure({apiKey: "appl_ScXuRrRgmmQzOxyXwbKlMzBpggx"});
        } 
        //tbd for android
       // else if (Platform.OS === 'android') {
         //  Purchases.configure({apiKey: <revenuecat_project_google_api_key>});
        //}//
    
      }, []);

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

    // Display current offering
return (
    <View style={{ flex: 1 }}>
        <RevenueCatUI.Paywall 
          onDismiss={() => {
            // Dismiss the paywall, i.e. remove the view, navigate to another screen, etc.
            // Will be called when the close button is pressed (if enabled) or when a purchase succeeds.
          }}
        />
    </View>
);
}