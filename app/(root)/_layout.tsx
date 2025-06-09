import {SafeAreaView} from "react-native-safe-area-context";
import { View,Platform, ActivityIndicator} from "react-native";
import { useEffect } from "react";
import { useGlobalContext } from "@/lib/global-provider";
import { Slot, Redirect } from "expo-router";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

export default function RootLayout() {

    useEffect(() => {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    
        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: "appl_ScXuRrRgmmQzOxyXwbKlMzBpggx" });
        } 
        
        //tbd do android
        //</appl_ScXuRrRgmmQzOxyXwbKlMzBpggx>else if (Platform.OS === 'android') {
        //    Purchases.configure({ apiKey: <public_google_api_key> });
    
          // OR: if building for Amazon, be sure to follow the installation instructions then:
   //         Purchases.configure({ apiKey: <public_amazon_api_key>, useAmazon: true });
     //   }
    
      }, []);
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    const {loading, isLoggedIn} = useGlobalContext();

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
)

    //return <Slot />;
}