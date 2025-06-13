import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { Slot, Redirect } from "expo-router";
import Purchases, {LOG_LEVEL} from "react-native-purchases";
import { Platform } from "react-native";
import { useEffect } from "react";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { GlobalProvider } from '@/lib/global-provider';

async function presentPaywallIfNeeded() {
    // Present paywall for current offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "entla0ee6b744d"
    });
}

export default function RootLayout() {
    const {loading, isLoggedIn, user} = useGlobalContext();

    useEffect(() => {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    
        if (Platform.OS === 'ios') {
           Purchases.configure({apiKey: "appl_ScXuRrRgmmQzOxyXwbKlMzBpggx"});
        } 
        //tbd add support for android else if (Platform.OS === 'android') {
        //   Purchases.configure({apiKey: <revenuecat_project_google_api_key>});
    
        //}
    
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
    else {
        presentPaywallIfNeeded();   
        return <Slot />;
    }
}