import GeoCoder from "react-native-geocoding";
import { Platform } from "react-native";
import * as Location from 'expo-location'
console.log('EXPO_PUBLIC_GOOGLE_API_KEY:', process.env.EXPO_PUBLIC_GOOGLE_API_KEY);
GeoCoder.init(process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ''); 

interface LocationData {
    City: string;
    County: string;
    State: string;
    Country: string;
    DeviceType: string;
  }

  const getLocationData = async (): Promise<LocationData> => {
    let lData: LocationData = {
      City: '',
      County: '',
      State: '',
      Country: '',
      DeviceType: Platform.OS
    };
    try{
        console.log('Device Type:', lData.DeviceType);
      
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return lData;
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log('Location###', location);
        const json = await GeoCoder.from(location.coords.latitude, location.coords.longitude);
        console.log('GeoCoder###', json);
      
        if (json.results && json.results.length > 0) {
            const addressComponents = json.results[0].address_components;

        
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            lData.City = component.long_name;
          } else if (component.types.includes('administrative_area_level_2')) {
            lData.County = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            lData.State = component.short_name;
          } else if (component.types.includes('country')) {
            lData.Country = component.long_name;
          }
        });
        
        console.log('City:', lData.City, 'County:', lData.County, 'State:', lData.State, 'Country:', lData.Country);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return lData;
  };

export { getLocationData, type LocationData };