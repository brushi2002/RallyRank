import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { Slot, Redirect } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { GlobalProvider } from '@/lib/global-provider';
import { markEmailVerified } from "@/lib/appwrite";


export default function VerifyEmail() {
    const {loading, isLoggedIn, user} = useGlobalContext();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');
    const promise = userId && secret ? markEmailVerified(userId, secret) : null;

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
        return <Slot />;
    }
}