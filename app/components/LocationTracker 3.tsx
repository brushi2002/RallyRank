import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export const LocationTracker = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View className="p-4">
        <Text className="text-red-500">{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="p-4">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-lg">
        Latitude: {location.coords.latitude}
      </Text>
      <Text className="text-lg">
        Longitude: {location.coords.longitude}
      </Text>
    </View>
  );
}; 